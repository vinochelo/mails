"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Stepper } from "@/components/stepper";
import { UploadStep } from "@/components/upload-step";
import { PreviewStep } from "@/components/preview-step";
import { GenerateStep } from "@/components/generate-step";

import type { Recipient, Invoice, GroupedData } from "@/lib/types";
import { placeholderRecipients, placeholderInvoices } from "@/lib/placeholder-data";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_EMAIL_TEMPLATE = `Estimado/a {{razon_social_emisor}},

Le enviamos un resumen de sus comprobantes pendientes:

{{invoices_table}}

Saludos cordiales,
El equipo de MassMailer Pro`;


function groupInvoicesByRecipient(recipients: Recipient[], invoices: Invoice[]): Map<string, GroupedData> {
  const recipientMap = new Map<string, Recipient>(recipients.map(r => [r.ruc, r]));
  const grouped = new Map<string, GroupedData>();

  for (const invoice of invoices) {
    if (recipientMap.has(invoice.ruc_emisor)) {
      if (!grouped.has(invoice.ruc_emisor)) {
        grouped.set(invoice.ruc_emisor, {
          recipient: recipientMap.get(invoice.ruc_emisor)!,
          invoices: [],
        });
      }
      grouped.get(invoice.ruc_emisor)!.invoices.push(invoice);
    }
  }
  return grouped;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [processedData, setProcessedData] = useState<Map<string, GroupedData> | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<string>(DEFAULT_EMAIL_TEMPLATE);
  const { toast } = useToast();

  const STEPS = ["Subir Datos", "Previsualizar", "Generar Correos"];

  const handleProcess = () => {
    toast({
      title: "Procesando datos...",
      description: "Agrupando facturas por destinatario.",
    });

    // Simulate async processing
    setTimeout(() => {
      const data = groupInvoicesByRecipient(placeholderRecipients, placeholderInvoices);
      setProcessedData(data);
      setStep(2);
      toast({
        title: "¡Éxito!",
        description: `Se procesaron los datos y se encontraron ${data.size} destinatarios.`,
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
          {step === 1 && <UploadStep onProcess={handleProcess} />}
          {step === 2 && processedData && <PreviewStep data={processedData} emailTemplate={emailTemplate} onTemplateChange={setEmailTemplate} onNext={handleGenerate} onBack={handleBack} />}
          {step === 3 && processedData && <GenerateStep data={processedData} emailTemplate={emailTemplate} onBack={handleBack} onStartOver={handleStartOver} />}
        </div>
      </main>
    </>
  );
}
