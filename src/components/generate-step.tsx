import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { GroupedData, Invoice } from "@/lib/types";
import { Mail, Send, RotateCcw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateStepProps {
  data: Map<string, GroupedData>;
  emailTemplate: string;
  onBack: () => void;
  onStartOver: () => void;
}

function generateInvoicesTable(invoices: Invoice[]): string {
    const header = `Tipo de Comprobante - Serie - Observaciones`;
    const rows = invoices.map(inv => 
        `${inv.TIPO_COMPROBANTE || ''} - ${inv.SERIE_COMPROBANTE || ''} - ${inv.OBSERVACIONES || ''}`
    );
    return [header, ...rows].join('\n');
}


function generateEmailBody(template: string, groupedData: GroupedData): string {
    const { recipient, invoices } = groupedData;
    const razonSocial = invoices[0]?.RAZON_SOCIAL_EMISOR || recipient.NOMBRE;
    const rucEmisor = invoices[0]?.RUC_EMISOR || recipient.RUC;
    const recipientEmails = recipient.CORREO;
    const invoicesTable = generateInvoicesTable(invoices);
    
    return template
        .replace(/{{razon_social_emisor}}/g, razonSocial)
        .replace(/{{ruc_emisor}}/g, rucEmisor)
        .replace(/{{nombre_destinatario}}/g, recipient.NOMBRE)
        .replace(/{{correo_destinatario}}/g, recipientEmails)
        .replace(/{{invoices_table}}/g, invoicesTable);
}


export function GenerateStep({ data, emailTemplate, onBack, onStartOver }: GenerateStepProps) {
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());
  const dataArray = Array.from(data.values());

  const handleOpenInOutlook = (recipientRuc: string, recipientEmail: string, subject: string, body: string) => {
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    const newSent = new Set(sentEmails);
    newSent.add(recipientRuc);
    setSentEmails(newSent);
  };

  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline">Correos Generados</h2>
        <p className="text-muted-foreground mt-2">Se han generado {data.size} borradores. Ábrelos individualmente para enviarlos.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dataArray.map((groupedData, index) => {
          const { recipient, invoices } = groupedData;
          const recipientEmails = recipient.CORREO;
          if (!recipientEmails) return null;

          const isSent = sentEmails.has(recipient.RUC);
          const razonSocial = invoices[0]?.RAZON_SOCIAL_EMISOR || recipient.NOMBRE;
          const subject = `Anulación de comprobantes`;
          const body = generateEmailBody(emailTemplate, groupedData);

          return (
            <Card 
              key={`${recipient.RUC}-${index}`} 
              className={cn(
                "flex flex-col bg-card transition-all duration-300",
                isSent && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                   <span className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold bg-primary/10",
                      isSent && "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                    )}
                  >
                    {isSent ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>
                  <div className="flex-1">
                    {razonSocial}
                    <CardDescription className="mt-1">Para: {recipientEmails}</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="font-semibold text-sm">Asunto: {subject}</p>
                <div className="text-xs text-muted-foreground p-3 bg-background rounded-md whitespace-pre-wrap font-mono h-48 overflow-y-auto border">
                  {body}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleOpenInOutlook(recipient.RUC, recipientEmails, subject, body)}
                >
                  {isSent ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Correo Abierto
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Abrir en cliente de correo
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center gap-4">
        <Button variant="outline" onClick={onBack}>Atrás</Button>
        <Button onClick={onStartOver}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Empezar de Nuevo
        </Button>
      </div>
    </div>
  );
}
