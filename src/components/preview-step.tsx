import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GroupedData } from "@/lib/types";
import { Mail, User, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PreviewStepProps {
  data: Map<string, GroupedData>;
  onNext: () => void;
  onBack: () => void;
}

export function PreviewStep({ data, onNext, onBack }: PreviewStepProps) {
  const dataArray = Array.from(data.values());

  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline">Datos Agrupados</h2>
        <p className="text-muted-foreground mt-2">Se encontraron {data.size} destinatarios. Revisa los comprobantes agrupados para cada uno.</p>
      </div>
      
      <Card>
        <Accordion type="single" collapsible className="w-full">
          {dataArray.map(({ recipient, invoices }, index) => (
            <AccordionItem key={recipient.ruc} value={recipient.ruc} className={index === dataArray.length - 1 ? "border-b-0" : ""}>
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-left">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <User className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{invoices[0]?.razon_social || recipient.nombre}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {recipient.correo}
                    </p>
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
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.serie_comprobante}>
                            <TableCell className="font-medium">{invoice.tipo_comprobante}</TableCell>
                            <TableCell>{invoice.serie_comprobante}</TableCell>
                            <TableCell>{invoice.observaciones}</TableCell>
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

      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={onBack}>Atrás</Button>
        <Button size="lg" onClick={onNext}>
          Generar Correos <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
