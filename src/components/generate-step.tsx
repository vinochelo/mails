
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { GroupedData, Invoice } from "@/lib/types";
import { Mail, Send, RotateCcw, CheckCircle, AlertTriangle, Pencil, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
    const razonSocial = recipient.NOMBRE || invoices[0]?.RAZON_SOCIAL_EMISOR;
    const rucEmisor = recipient.RUC || invoices[0]?.RUC_EMISOR;
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
  const { toast } = useToast();
  const dataArray = Array.from(data.values());
  const totalCount = data.size;
  const sentCount = sentEmails.size;
  const remainingCount = totalCount - sentCount;
  
  const alertTriggered = useRef(false);

  useEffect(() => {
    // Alerta de 5 minutos si quedan correos pendientes
    const timer = setTimeout(() => {
      if (!alertTriggered.current && sentEmails.size < totalCount) {
        toast({
          variant: "destructive",
          title: "¡Atención: Tiempo excedido!",
          description: `Han pasado 5 minutos y todavía faltan ${totalCount - sentEmails.size} correos por procesar.`,
        });
        alertTriggered.current = true;
      }
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [totalCount, sentEmails.size, toast]);

  const handleOpenInOutlook = (recipientRuc: string, recipientEmail: string, subject: string, body: string) => {
    const mailtoLink = `mailto:${recipientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    const newSent = new Set(sentEmails);
    newSent.add(recipientRuc);
    setSentEmails(newSent);
  };

  return (
    <div className="w-full animate-in fade-in-50 duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold font-headline">Correos Listos</h2>
            <p className="text-muted-foreground mt-2 text-lg">Se han preparado {totalCount} borradores para envío masivo.</p>
        </div>
        
        {/* Pending counter in top right */}
        <div className="flex items-center gap-5 bg-card border-2 border-primary/20 rounded-2xl px-8 py-4 shadow-xl">
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Restantes</span>
                <span className={cn(
                  "text-4xl font-black font-headline leading-none mt-1",
                  remainingCount > 0 ? "text-primary" : "text-green-500"
                )}>
                  {remainingCount}
                </span>
            </div>
            <div className="h-12 w-px bg-border mx-2" />
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500",
              remainingCount > 0 ? "bg-primary/10 text-primary" : "bg-green-100 text-green-600 scale-110"
            )}>
                {remainingCount === 0 ? <CheckCircle className="h-8 w-8" /> : <Mail className="h-8 w-8" />}
            </div>
        </div>
      </div>

      {remainingCount > 0 && (
        <div className="mb-8 flex items-center gap-3 p-4 bg-primary/5 text-primary rounded-xl border border-primary/10 animate-pulse shadow-sm">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-semibold">Recibirás una alerta en 5 minutos si todavía quedan correos pendientes.</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {dataArray.map((groupedData, index) => {
          const { recipient, invoices } = groupedData;
          const recipientEmails = recipient.CORREO;

          const isSent = sentEmails.has(recipient.RUC);
          const hasEmail = !!recipientEmails;
          const razonSocial = recipient.NOMBRE || invoices[0]?.RAZON_SOCIAL_EMISOR;
          const subject = `Anulación de comprobantes`;
          const body = generateEmailBody(emailTemplate, groupedData);

          return (
            <Card 
              key={`${recipient.RUC}-${index}`} 
              className={cn(
                "flex flex-col bg-card transition-all duration-300 border-2",
                isSent ? "bg-green-50/30 dark:bg-green-950/5 border-green-200 dark:border-green-800 opacity-75" : "border-transparent shadow-lg hover:shadow-2xl hover:-translate-y-1",
                !hasEmail && !isSent && "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800"
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                    <Badge variant={isSent ? "default" : !hasEmail ? "destructive" : "secondary"} className={cn("px-3 py-1 font-bold", isSent && "bg-green-600")}>
                        {isSent ? "ABIERTO" : !hasEmail ? "FALTA CORREO" : "PENDIENTE"}
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground/50 tracking-tighter">#{index + 1}</span>
                </div>
                <CardTitle className="flex items-start gap-4 text-xl">
                   <span className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-inner",
                      isSent && "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
                      !hasEmail && !isSent && "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400",
                      !isSent && hasEmail && "bg-primary/10 text-primary"
                    )}
                  >
                    {isSent ? <CheckCircle className="h-6 w-6" /> : !hasEmail ? <AlertTriangle className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-headline font-bold leading-tight" title={razonSocial}>{razonSocial}</p>
                    <CardDescription className={cn("mt-2 truncate font-medium", !hasEmail && "text-amber-600 dark:text-amber-500")}>
                        {hasEmail ? recipientEmails : "Sin correo - Ingresar manualmente"}
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 px-6">
                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Vista previa</span>
                    <div className="h-px flex-1 bg-border" />
                </div>
                <div className="text-[11px] text-muted-foreground p-4 bg-muted/30 rounded-xl whitespace-pre-wrap font-mono h-48 overflow-y-auto border shadow-inner leading-relaxed">
                  {body}
                </div>
              </CardContent>
              <CardFooter className="p-6">
                <Button 
                  className={cn(
                    "w-full h-12 transition-all font-black tracking-wide text-xs uppercase",
                    isSent ? "bg-green-600 hover:bg-green-700 text-white" : hasEmail ? "bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02]" : "bg-amber-600 hover:bg-amber-700 text-white"
                  )} 
                  onClick={() => handleOpenInOutlook(recipient.RUC, recipientEmails, subject, body)}
                >
                  {isSent ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Reabrir en Outlook
                    </>
                  ) : hasEmail ? (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Correo
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Añadir y Enviar
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-6">
        <Button variant="outline" size="lg" onClick={onBack} className="w-full sm:w-64 font-bold h-14 border-2">Atrás</Button>
        <Button size="lg" onClick={onStartOver} className="w-full sm:w-64 font-bold h-14 shadow-xl">
            <RotateCcw className="mr-2 h-5 w-5" />
            Empezar de Nuevo
        </Button>
      </div>
    </div>
  );
}
