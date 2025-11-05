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

const DEFAULT_EMAIL_TEMPLATE = `Estimados señores de {{razon_social_emisor}},

Por medio de la presente, nos dirigimos a ustedes con el fin de solicitar la anulación de los siguientes comprobantes registrados en el SRI.

El motivo de la anulación junto con el detalle de los comprobantes, se encuentra a continuación:

{{razon_social_emisor}} {{ruc_emisor}}

{{invoices_table}}
`;


function groupInvoicesByRecipient(recipients: Recipient[], invoices: Invoice[]): Map<string, GroupedData> {
  const recipientMap = new Map<string, Recipient>(recipients.map(r => [String(r.RUC), r]));
  const grouped = new Map<string, GroupedData>();

  for (const invoice of invoices) {
    const rucEmisor = String(invoice['RUC_EMISOR']);
    if (recipientMap.has(rucEmisor)) {
      const recipient = recipientMap.get(rucEmisor)!;
      if (!grouped.has(rucEmisor)) {
        grouped.set(rucEmisor, {
          recipient: recipient,
          invoices: [],
        });
      }
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

  const parseFile = <T>(file: File, startRow: number): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { range: startRow - 1, defval: "" }) as T[];
          resolve(json);
        } catch (error) {
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
            description: "Asegúrate de que es un archivo Excel válido.",
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
            description: "Asegúrate de que es un archivo Excel válido.",
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
            title: "No se encontraron coincidencias",
            description: "No se pudo agrupar ninguna factura. Revisa que los RUCs coincidan en ambos archivos.",
          });
          return;
      }
      setProcessedData(data);
      setStep(2);
      toast({
        title: "¡Éxito!",
        description: `Se procesaron los datos y se encontraron ${data.size} destinatarios con facturas.`,
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
    </>
  );
}
