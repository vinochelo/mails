import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GroupedData } from "@/lib/types";
import { Mail, User, ChevronRight, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PreviewStepProps {
  data: Map<string, GroupedData>;
  emailTemplate: string;
  onTemplateChange: (template: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PreviewStep({ data, emailTemplate, onTemplateChange, onNext, onBack }: PreviewStepProps) {
  const dataArray = Array.from(data.values());

  const availableTags = [
    { tag: "{{razon_social_emisor}}", description: "Razón social del emisor de la factura." },
    { tag: "{{ruc_emisor}}", description: "RUC del emisor de la factura." },
    { tag: "{{nombre_destinatario}}", description: "Nombre del contacto del destinatario (proveedor)." },
    { tag: "{{correo_destinatario}}", description: "Correo electrónico del destinatario (proveedor)." },
    { tag: "{{invoices_table}}", description: "Tabla con el detalle de los comprobantes." },
  ];

  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline">Datos Agrupados</h2>
        <p className="text-muted-foreground mt-2">Se encontraron {data.size} emisores de comprobantes. Revisa los detalles para cada uno.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <Accordion type="single" collapsible className="w-full" defaultValue={dataArray[0]?.recipient.RUC}>
                {dataArray.map(({ recipient, invoices }, index) => (
                    <AccordionItem key={`${recipient.RUC}-${index}`} value={recipient.RUC} className={index === dataArray.length - 1 ? "border-b-0" : ""}>
                    <AccordionTrigger className="px-6 py-4 hover:no-underline text-left">
                        <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                            <User className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{recipient.NOMBRE || invoices[0]?.RAZON_SOCIAL_EMISOR}</p>
                            {recipient.CORREO ? (
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {recipient.CORREO}
                                </p>
                            ) : (
                                <p className="text-sm text-amber-600 dark:text-amber-500 flex items-center gap-2 font-medium">
                                    <AlertTriangle className="h-4 w-4" />
                                    Correo no encontrado
                                </p>
                            )}
                        </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo de Comprobante</TableHead>
                                    <TableHead>Serie</TableHead>
                                    <TableHead className="min-w-[250px]">Observaciones</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {invoices.map((invoice, invIndex) => (
                                    <TableRow key={`${invoice.SERIE_COMPROBANTE}-${invIndex}`}>
                                    <TableCell className="font-medium">{invoice.TIPO_COMPROBANTE}</TableCell>
                                    <TableCell>{invoice.SERIE_COMPROBANTE}</TableCell>
                                    <TableCell>{invoice.OBSERVACIONES}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Personalizar Plantilla de Correo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid w-full gap-1.5">
                        <Label htmlFor="email-template">Plantilla Base</Label>
                        <Textarea 
                            id="email-template"
                            placeholder="Escribe tu plantilla aquí..." 
                            className="h-64 font-code text-xs"
                            value={emailTemplate}
                            onChange={(e) => onTemplateChange(e.target.value)}
                        />
                    </div>
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            <p className="font-bold mb-2">Variables disponibles:</p>
                            <ul className="space-y-1 text-xs">
                                {availableTags.map(t => (
                                    <li key={t.tag}>
                                        <code className="font-semibold p-1 bg-muted rounded-sm">{t.tag}</code>: {t.description}
                                    </li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
      </div>


      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={onBack}>Atrás</Button>
        <Button size="lg" onClick={onNext}>
          Generar Correos <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
