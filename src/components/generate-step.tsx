import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { GroupedData, Invoice } from "@/lib/types";
import { Mail, Send, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GenerateStepProps {
  data: Map<string, GroupedData>;
  onBack: () => void;
  onStartOver: () => void;
}

function generatePlainTextBody(razonSocial: string, invoices: Invoice[]): string {
    const header = `Estimado/a ${razonSocial},\n\nLe enviamos un resumen de sus comprobantes pendientes:\n\n`;
    
    const invoiceLines = invoices.map(inv => 
        `-----------------------------------\n` +
        `Tipo: ${inv.tipo_comprobante}\n` +
        `Serie: ${inv.serie_comprobante}\n` +
        `Observaciones: ${inv.observaciones}`
    ).join('\n');

    const footer = `\n\nSaludos cordiales,\nEl equipo de MassMailer Pro`;

    return header + invoiceLines + footer;
}

export function GenerateStep({ data, onBack, onStartOver }: GenerateStepProps) {
  const { toast } = useToast();
  const dataArray = Array.from(data.values());

  const handleOpenInOutlook = (recipientEmail: string, subject: string, body: string) => {
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    toast({
      title: "Abriendo cliente de correo",
      description: `Se está preparando un borrador para ${recipientEmail}.`,
    });
  };

  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline">Correos Generados</h2>
        <p className="text-muted-foreground mt-2">Se han generado {data.size} borradores de correo. Haga clic para abrirlos en su cliente de correo predeterminado.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dataArray.map(({ recipient, invoices }) => {
          const razonSocial = invoices[0]?.razon_social || recipient.nombre;
          const subject = `Resumen de Comprobantes - ${razonSocial}`;
          const body = generatePlainTextBody(razonSocial, invoices);

          return (
            <Card key={recipient.ruc} className="flex flex-col bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </span>
                  {razonSocial}
                </CardTitle>
                <CardDescription>Para: {recipient.correo}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="font-semibold text-sm">Asunto: {subject}</p>
                <div className="text-xs text-muted-foreground p-3 bg-background rounded-md whitespace-pre-wrap font-code h-48 overflow-y-auto border">
                  {body}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleOpenInOutlook(recipient.correo, subject, body)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Abrir en cliente de correo
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
