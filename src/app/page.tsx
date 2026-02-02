
"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Header } from "@/components/header";
import { Stepper } from "@/components/stepper";
import { UploadStep } from "@/components/upload-step";
import { PreviewStep } from "@/components/preview-step";
import { GenerateStep } from "@/components/generate-step";

import type { Recipient, Invoice, GroupedData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Analytics } from "@vercel/analytics/react";

const DEFAULT_EMAIL_TEMPLATE = `Estimados señores de {{razon_social_emisor}},

Por medio de la presente, nos dirigimos a ustedes con el fin de solicitar la anulación de los siguientes comprobantes registrados en el SRI.

El motivo de la anulación junto con el detalle de los comprobantes, se encuentra a continuación:

{{razon_social_emisor}} {{ruc_emisor}}

{{invoices_table}}
`;

function groupInvoicesByRecipient(recipients: Recipient[], invoices: Invoice[]): Map<string, GroupedData> {
  const cleanString = (val: any): string => String(val || '').trim();
  const grouped = new Map<string, GroupedData>();
  const recipientsByRuc = new Map(recipients.map(r => [cleanString(r.RUC), r]));

  for (const invoice of invoices) {
    const rucEmisor = cleanString(invoice.RUC_EMISOR);
    if (!rucEmisor) continue;

    if (!grouped.has(rucEmisor)) {
      const recipient = recipientsByRuc.get(rucEmisor);
      const initialRecipientData: Recipient = recipient || {
        RUC: rucEmisor,
        NOMBRE: cleanString(invoice.RAZON_SOCIAL_EMISOR),
        CORREO: '',
        CODIGO: ''
      };
      
      grouped.set(rucEmisor, {
        recipient: initialRecipientData,
        invoices: [],
      });
    }

    grouped.get(rucEmisor)!.invoices.push(invoice);
  }

  return grouped;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recipientFile, setRecipientFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<Map<string, GroupedData> | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<string>(DEFAULT_EMAIL_TEMPLATE);
  const [lastRecipientsUpdate, setLastRecipientsUpdate] = useState<string | null>(null);
  const { toast } = useToast();

  const STEPS = ["Subir Datos", "Previsualizar", "Generar Correos"];

  // Load from localStorage on mount
  useEffect(() => {
    const savedRecipients = localStorage.getItem("hola_mails_recipients");
    const savedUpdateDate = localStorage.getItem("hola_mails_last_update");
    
    if (savedRecipients) {
      try {
        setRecipients(JSON.parse(savedRecipients));
      } catch (e) {
        console.error("Error loading recipients from storage", e);
      }
    }
    
    if (savedUpdateDate) {
      setLastRecipientsUpdate(savedUpdateDate);
    }
  }, []);

  // Ensures that when changing steps, the page scrolls to the top immediately
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const parseFile = <T extends Record<string, any>>(file: File, startRow: number): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            raw: false, 
          });

          if (rows.length < startRow) {
            resolve([]);
            return;
          }
          
          const headerRowIndex = startRow > 1 ? startRow - 2 : 0;
          if (rows.length <= headerRowIndex) {
             reject(new Error(`La fila de encabezado (${headerRowIndex + 1}) no existe en el archivo.`));
             return;
          }
          const header = rows[headerRowIndex].map(h => String(h || '').trim());
          
          const dataRows = rows.slice(startRow - 1);

          const json = dataRows.map(row => {
            const rowData: T = {} as T;
            header.forEach((key, index) => {
              rowData[key as keyof T] = String(row[index] ?? '').trim() as T[keyof T];
            });
            return rowData;
          });

          resolve(json);
        } catch (error) {
          console.error("Error parsing file:", error);
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };
  
  const handleRecipientsUpload = async (file: File, startRow: number) => {
    setRecipientFile(file);
    try {
        const parsedRecipients = await parseFile<Recipient>(file, startRow);
        setRecipients(parsedRecipients);
        
        // Save to localStorage
        const now = new Date().toISOString();
        localStorage.setItem("hola_mails_recipients", JSON.stringify(parsedRecipients));
        localStorage.setItem("hola_mails_last_update", now);
        setLastRecipientsUpdate(now);

        toast({
            title: "Archivo de destinatarios cargado",
            description: `Se encontraron ${parsedRecipients.length} destinatarios y se guardaron en el navegador.`,
        });
    } catch(e) {
        toast({
            variant: "destructive",
            title: "Error al leer el archivo",
            description: e instanceof Error ? e.message : "Error al cargar destinatarios.",
        });
        setRecipientFile(null);
    }
  };

  const handleInvoicesUpload = async (file: File, startRow: number) => {
    setInvoiceFile(file);
     try {
        const parsedInvoices = await parseFile<Invoice>(file, startRow);
        setInvoices(parsedInvoices);
        toast({
            title: "Archivo de comprobantes cargado",
            description: `Se encontraron ${parsedInvoices.length} comprobantes.`,
        });
    } catch(e) {
        toast({
            variant: "destructive",
            title: "Error al leer el archivo",
            description: e instanceof Error ? e.message : "Error al cargar comprobantes.",
        });
        setInvoiceFile(null);
    }
  };

  const handleProcess = () => {
    if (recipients.length === 0 || invoices.length === 0) {
      toast({
        variant: "destructive",
        title: "Faltan archivos",
        description: "Por favor, sube ambos archivos para continuar.",
      });
      return;
    }
    
    const data = groupInvoicesByRecipient(recipients, invoices);
    if (data.size === 0) {
        toast({
          variant: "destructive",
          title: "No se procesaron datos",
          description: "No se pudo agrupar ningún comprobante. Revisa los archivos.",
        });
        return;
    }
    setProcessedData(data);
    setStep(2);
  };

  const handleGenerate = () => {
    setStep(3);
  };
  
  const handleBack = () => {
    if (step > 1) {
      if (step === 2) {
          setProcessedData(null);
      }
      setStep(step - 1);
    }
  };
  
  const handleStartOver = () => {
    setProcessedData(null);
    setInvoices([]);
    setInvoiceFile(null);
    setEmailTemplate(DEFAULT_EMAIL_TEMPLATE);
    setStep(1);
  }

  const handleClearRecipients = () => {
    setRecipients([]);
    setRecipientFile(null);
    setLastRecipientsUpdate(null);
    localStorage.removeItem("hola_mails_recipients");
    localStorage.removeItem("hola_mails_last_update");
    toast({
      title: "Base de datos eliminada",
      description: "La información de destinatarios ha sido borrada del navegador.",
    });
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto mb-16 flex justify-center">
            <Stepper currentStep={step} steps={STEPS} />
        </div>
        
        <div className="max-w-7xl mx-auto">
          {step === 1 && (
            <UploadStep 
              onProcess={handleProcess} 
              onRecipientsUpload={handleRecipientsUpload} 
              onInvoicesUpload={handleInvoicesUpload} 
              recipientFile={recipientFile} 
              invoiceFile={invoiceFile} 
              recipientsCount={recipients.length}
              lastRecipientsUpdate={lastRecipientsUpdate}
              onClearRecipients={handleClearRecipients}
            />
          )}
          {step === 2 && processedData && <PreviewStep data={processedData} emailTemplate={emailTemplate} onTemplateChange={setEmailTemplate} onNext={handleGenerate} onBack={handleBack} />}
          {step === 3 && processedData && <GenerateStep data={processedData} emailTemplate={emailTemplate} onBack={handleBack} onStartOver={handleStartOver} />}
        </div>
      </main>
      <Analytics />
    </>
  );
}
