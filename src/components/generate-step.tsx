import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { GroupedData, Invoice } from "@/lib/types";
import { Mail, Send, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "./ui/label";

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
  const { toast } = useToast();
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const dataArray = Array.from(data.values());

  const handleOpenInOutlook = (recipientRuc: string, recipientEmail: string, subject: string, body: string) => {
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    setSentEmails(prev => new Set(prev).add(recipientRuc));
  };
  
   const handleBatchOpen = () => {
     if (selectedEmails.size === 0) {
      toast({
        variant: "destructive",
        title: "No hay correos seleccionados",
        description: "Por favor, selecciona al menos un correo para abrir.",
      });
      return;
    }
    
    toast({
      title: "Abriendo correos seleccionados",
      description: `Se intentarán abrir ${selectedEmails.size} borradores. Revisa tu navegador.`,
    });

    const newSent = new Set(sentEmails);
    let openedCount = 0;

    dataArray.forEach((groupedData, index) => {
        const ruc = groupedData.recipient.RUC;
        if(selectedEmails.has(ruc)) {
            const body = generateEmailBody(emailTemplate, groupedData);
            const subject = `Anulación de comprobantes`;
            const mailtoLink = `mailto:${groupedData.recipient.CORREO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Introduce a delay to prevent popup blockers from stopping all windows.
            setTimeout(() => {
                const newWindow = window.open(mailtoLink, `_blank_email_${index}`);
                if (!newWindow) {
                    console.warn(`Could not open a new window for RUC ${ruc}. It might have been blocked by a popup blocker.`);
                }
            }, index * 300); // 300ms delay between each opening

            newSent.add(ruc);
            openedCount++;
        }
    });

    if (openedCount > 0) {
        setSentEmails(newSent);
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allRucs = new Set(dataArray.map(d => d.recipient.RUC));
      setSelectedEmails(allRucs);
    } else {
      setSelectedEmails(new Set());
    }
  }
  
  const handleSelectOne = (ruc: string, checked: boolean) => {
      const newSelected = new Set(selectedEmails);
      if (checked) {
          newSelected.add(ruc);
      } else {
          newSelected.delete(ruc);
      }
      setSelectedEmails(newSelected);
  }

  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline">Correos Generados</h2>
        <p className="text-muted-foreground mt-2">Se han generado {data.size} borradores. Selecciona los que desees o ábrelos individualmente.</p>
      </div>

       <div className="max-w-4xl mx-auto mb-8">
         <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center space-x-2">
                 <Checkbox 
                    id="select-all" 
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                    checked={selectedEmails.size > 0 && selectedEmails.size === dataArray.length}
                />
                 <Label htmlFor="select-all" className="font-semibold text-sm">
                    Seleccionar Todo ({selectedEmails.size} / {dataArray.length})
                 </Label>
               </div>
               <Button onClick={handleBatchOpen} disabled={selectedEmails.size === 0}>
                <Send className="mr-2 h-4 w-4" />
                Abrir {selectedEmails.size > 0 ? `${selectedEmails.size} Correos` : 'Seleccionados'}
               </Button>
            </CardContent>
             {selectedEmails.size > 0 && (
                <CardFooter className="p-4 border-t">
                     <Alert variant="default" className="border-amber-500 text-amber-700">
                       <AlertTriangle className="h-4 w-4 !text-amber-600" />
                       <AlertDescription className="text-xs">
                          Tu navegador puede bloquear la apertura de múltiples ventanas. Si esto sucede, busca un ícono en la barra de direcciones para **permitir las ventanas emergentes** de este sitio.
                       </AlertDescription>
                    </Alert>
                </CardFooter>
             )}
         </Card>
       </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dataArray.map((groupedData, index) => {
          const { recipient, invoices } = groupedData;
          const recipientEmails = recipient.CORREO;
          if (!recipientEmails) return null;

          const isSent = sentEmails.has(recipient.RUC);
          const isSelected = selectedEmails.has(recipient.RUC);
          const razonSocial = invoices[0]?.RAZON_SOCIAL_EMISOR || recipient.NOMBRE;
          const subject = `Anulación de comprobantes`;
          const body = generateEmailBody(emailTemplate, groupedData);

          return (
            <Card 
              key={`${recipient.RUC}-${index}`} 
              className={cn(
                "flex flex-col bg-card transition-all duration-300",
                isSent && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                isSelected && !isSent && "border-primary shadow-lg scale-105"
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
                   <Checkbox 
                     className="mt-1"
                     checked={isSelected}
                     onCheckedChange={(checked) => handleSelectOne(recipient.RUC, checked === true)}
                   />
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
                      Reabrir Correo
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Abrir correo individual
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
