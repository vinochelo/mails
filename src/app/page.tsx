"use client";

import { useState } from "react";
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

  // 1. First, create an entry for every recipient, with an empty invoices array.
  for (const recipient of recipients) {
    const ruc = cleanString(recipient.RUC);
    if (ruc) {
      if (!grouped.has(ruc)) {
        grouped.set(ruc, {
          recipient: recipient,
          invoices: [],
        });
      }
    }
  }

  // 2. Then, iterate over invoices and push them to the corresponding recipient.
  for (const invoice of invoices) {
    const rucEmisor = cleanString(invoice.RUC_EMISOR);
    if (grouped.has(rucEmisor)) {
      grouped.get(rucEmisor)!.invoices.push(invoice);
    }
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
  const { toast } = useToast();

  const STEPS = ["Subir Datos", "Previsualizar", "Generar Correos"];

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
        toast({
            title: "Archivo de destinatarios cargado",
            description: `Se encontraron ${parsedRecipients.length} destinatarios.`,
        });
    } catch(e) {
        toast({
            variant: "destructive",
            title: "Error al leer el archivo",
            description: e instanceof Error ? e.message : "Asegúrate de que es un archivo Excel válido y la fila de inicio es correcta.",
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
            description: e instanceof Error ? e.message : "Asegúrate de que es un archivo Excel válido y la fila de inicio es correcta.",
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
    
    toast({
      title: "Procesando datos...",
      description: "Agrupando facturas por destinatario.",
    });

    setTimeout(() => {
      const data = groupInvoicesByRecipient(recipients, invoices);
      if (data.size === 0) {
          toast({
            variant: "destructive",
            title: "No se encontraron destinatarios",
            description: "No se pudo encontrar ningún destinatario en el archivo. Revisa que el archivo y la fila de inicio sean correctos.",
          });
          return;
      }
      setProcessedData(data);
      setStep(2);
      toast({
        title: "¡Éxito!",
        description: `Se procesaron los datos para ${data.size} destinatarios.`,
      });
    }, 1000);
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
    setRecipients([]);
    setInvoices([]);
    setRecipientFile(null);
    setInvoiceFile(null);
    setEmailTemplate(DEFAULT_EMAIL_TEMPLATE);
    setStep(1);
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto mb-16 flex justify-center">
            <Stepper currentStep={step} steps={STEPS} />
        </div>
        
        <div className="max-w-7xl mx-auto">
          {step === 1 && <UploadStep onProcess={handleProcess} onRecipientsUpload={handleRecipientsUpload} onInvoicesUpload={handleInvoicesUpload} recipientFile={recipientFile} invoiceFile={invoiceFile} />}
          {step === 2 && processedData && <PreviewStep data={processedData} emailTemplate={emailTemplate} onTemplateChange={setEmailTemplate} onNext={handleGenerate} onBack={handleBack} />}
          {step === 3 && processedData && <GenerateStep data={processedData} emailTemplate={emailTemplate} onBack={handleBack} onStartOver={handleStartOver} />}
        </div>
      </main>
      <Analytics />
    </>
  );
}
