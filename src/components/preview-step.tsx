
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GroupedData } from "@/lib/types";
import { Mail, User, ChevronRight, Info, AlertTriangle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const highlightTags = (text: string) => {
    let highlighted = text;
    availableTags.forEach(({ tag }) => {
      const regex = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      highlighted = highlighted.replace(regex, `<span class="text-orange-700 dark:text-orange-300 font-black bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800 shadow-sm">${tag}</span>`);
    });
    return highlighted.split('\n').map((line, i) => (
      <div key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
    ));
  };

  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline">Revisión y Personalización</h2>
        <p className="text-muted-foreground mt-2">Se encontraron {data.size} emisores de comprobantes. Revisa los detalles y personaliza tu correo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card className="overflow-hidden border-2 shadow-md">
                <Accordion type="single" collapsible className="w-full" defaultValue={dataArray[0]?.recipient.RUC}>
                {dataArray.map(({ recipient, invoices }, index) => (
                    <AccordionItem key={`${recipient.RUC}-${index}`} value={recipient.RUC} className={index === dataArray.length - 1 ? "border-b-0" : ""}>
                    <AccordionTrigger className="px-6 py-4 hover:no-underline text-left hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-6 w-6 text-primary" />
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
                    <AccordionContent className="px-6 pb-4 bg-muted/20">
                        <div className="overflow-x-auto rounded-lg border bg-card">
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
                                    <TableCell className="text-muted-foreground">{invoice.OBSERVACIONES}</TableCell>
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
            <Card className="sticky top-8 border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/50">
                    <CardTitle className="text-xl font-headline">Plantilla de Correo</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <Tabs defaultValue="edit" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="edit">Editar</TabsTrigger>
                            <TabsTrigger value="preview">
                                <Eye className="h-4 w-4 mr-2" />
                                Vista Previa
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit" className="space-y-4">
                            <div className="grid w-full gap-2">
                                <Label htmlFor="email-template" className="font-bold">Cuerpo del mensaje</Label>
                                <Textarea 
                                    id="email-template"
                                    placeholder="Estimados señores..." 
                                    className="h-[400px] font-mono text-sm leading-relaxed focus:ring-primary/50"
                                    value={emailTemplate}
                                    onChange={(e) => onTemplateChange(e.target.value)}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="preview">
                            <div className="p-6 bg-secondary/20 rounded-xl border-2 border-dashed min-h-[400px] font-body text-sm whitespace-pre-wrap leading-loose shadow-inner">
                                {highlightTags(emailTemplate)}
                            </div>
                        </TabsContent>
                    </Tabs>

                     <Alert className="bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900">
                        <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <AlertDescription>
                            <p className="font-bold mb-3 text-orange-800 dark:text-orange-200 text-xs">Variables dinámicas:</p>
                            <ul className="space-y-2 text-xs">
                                {availableTags.map(t => (
                                    <li key={t.tag} className="flex flex-col gap-1">
                                        <code className="font-bold text-orange-700 dark:text-orange-300 w-fit px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 rounded border border-orange-200 dark:border-orange-800">{t.tag}</code>
                                        <span className="text-muted-foreground italic">{t.description}</span>
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
        <Button variant="outline" size="lg" onClick={onBack} className="px-8 font-bold">Atrás</Button>
        <Button size="lg" onClick={onNext} className="px-12 font-bold shadow-lg shadow-primary/20">
          Generar Correos <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
