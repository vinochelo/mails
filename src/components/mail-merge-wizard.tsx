"use client";

import React, { useState, useMemo } from 'react';
import { UploadCloud, FileCheck2, Columns, MailPlus, Sparkles, Eye, Download, Send, ChevronRight, ChevronLeft, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { emailAutocompletion } from '@/ai/flows/email-autocompletion';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data to simulate Excel file parsing
const mockEmailFile = {
  name: 'destinatarios.xlsx',
  size: 1024,
  headers: ['ID', 'RUC', 'Correo Electrónico', 'Nombre Contacto'],
  rows: [
    { RUC: '20551234567', 'Correo Electrónico': 'contacto@empresa-a.com', 'Nombre Contacto': 'Juan Pérez' },
    { RUC: '20557654321', 'Correo Electrónico': 'gerencia@empresa-b.com', 'Nombre Contacto': 'Maria García' },
    { RUC: '10451234567', 'Correo Electrónico': 'soporte@persona-c.com', 'Nombre Contacto': 'Carlos Rodriguez' },
  ],
};

const mockDataFile = {
  name: 'datos.xlsx',
  size: 2048,
  headers: ['RUC_CLIENTE', 'RAZON_SOCIAL', 'NRO_FACTURA', 'MONTO_DEUDA', 'FECHA_VENCIMIENTO'],
  rows: [
    { RUC_CLIENTE: '20551234567', RAZON_SOCIAL: 'Empresa A S.A.C.', NRO_FACTURA: 'F001-0123', MONTO_DEUDA: 500.00, FECHA_VENCIMIENTO: '2024-08-30' },
    { RUC_CLIENTE: '20551234567', RAZON_SOCIAL: 'Empresa A S.A.C.', NRO_FACTURA: 'F001-0125', MONTO_DEUDA: 1250.75, FECHA_VENCIMIENTO: '2024-09-15' },
    { RUC_CLIENTE: '20557654321', RAZON_SOCIAL: 'Empresa B S.R.L.', NRO_FACTURA: 'E001-456', MONTO_DEUDA: 3420.50, FECHA_VENCIMIENTO: '2024-08-25' },
    { RUC_CLIENTE: '10451234567', RAZON_SOCIAL: 'Carlos Rodriguez', NRO_FACTURA: 'B001-987', MONTO_DEUDA: 150.00, FECHA_VENCIMIENTO: '2024-09-05' },
  ],
};


const FileDropzone = ({ title, file, onFileSelect, icon: Icon, description }) => (
  <div className="flex-1">
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg h-48">
          {file ? (
            <div className="text-center">
              <FileCheck2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <p className="font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              <Button variant="link" size="sm" className="mt-2" onClick={onFileSelect}>
                Cambiar archivo
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Simulación de carga de archivos</p>
              <Button onClick={onFileSelect}>Seleccionar Archivo</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);


const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, title: 'Subir Archivos', icon: UploadCloud },
    { num: 2, title: 'Mapear Columnas', icon: Columns },
    { num: 3, title: 'Crear Correo', icon: MailPlus },
    { num: 4, title: 'Vista Previa y Envío', icon: Send },
  ];
  return (
    <div className="flex items-start justify-center mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center text-center w-24">
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                currentStep > step.num ? 'bg-primary border-primary text-primary-foreground' :
                currentStep === step.num ? 'bg-primary/20 border-primary text-primary' :
                'bg-card border-border text-muted-foreground'
              )}
            >
              <step.icon className="w-6 h-6" />
            </div>
            <p className={cn(
              'mt-2 text-sm font-medium transition-colors duration-300',
              currentStep >= step.num ? 'text-foreground' : 'text-muted-foreground'
            )}>{step.title}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              'flex-auto border-t-2 mt-6 mx-4 transition-colors duration-300',
              currentStep > step.num ? 'border-primary' : 'border-border'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};


export default function MailMergeWizard() {
  const [step, setStep] = useState(1);
  const [emailsFile, setEmailsFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [mappings, setMappings] = useState({ emailRuc: '', emailAddress: '', dataRuc: '', dataFields: {} });
  const [emailTemplate, setEmailTemplate] = useState('Estimado/a {{Nombre Contacto}},\n\nLe escribimos de parte de nuestra empresa en relación a sus facturas pendientes.\n\nSegún nuestros registros, los detalles son los siguientes:\n{{invoice_details}}\n\nPor favor, considere este comunicado como un recordatorio amigable.\n\nSaludos cordiales,\nEl equipo de Cobranzas');
  const [commonStructures, setCommonStructures] = useState('Recordatorio de pago. Facturas pendientes. Regularizar situación.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { toast } = useToast();

  const handleNextStep = () => setStep(s => Math.min(s + 1, 4));
  const handlePrevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const allDataFields = useMemo(() => {
    if (!dataFile) return [];
    return dataFile.headers.filter(h => h !== mappings.dataRuc);
  }, [dataFile, mappings.dataRuc]);

  const handleGenerateWithAI = async () => {
    if (!emailTemplate) {
      toast({ title: "Error", description: "El cuerpo del correo no puede estar vacío.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const rawRecipientData = mockDataFile.rows[0];
      const recipientData = Object.fromEntries(
        Object.entries(rawRecipientData).map(([key, value]) => [key, String(value)])
      );
      const template = emailTemplate;
      
      const res = await emailAutocompletion({ template, recipientData, commonStructures });
      setEmailTemplate(res.completedEmail);
      toast({ title: "¡Éxito!", description: "El correo ha sido mejorado con IA." });
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({ title: "Error de IA", description: "No se pudo generar el texto.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGeneratePreviews = () => {
    setIsGenerating(true);
    // Simulate processing delay
    setTimeout(() => {
      try {
        const emailMap = new Map(mockEmailFile.rows.map(row => [row[mappings.emailRuc], row[mappings.emailAddress]]));
        
        const dataByRuc = mockDataFile.rows.reduce((acc, row) => {
          const ruc = row[mappings.dataRuc];
          if (!acc[ruc]) acc[ruc] = [];
          acc[ruc].push(row);
          return acc;
        }, {});

        const generatedPreviews = Object.entries(dataByRuc).map(([ruc, rows]) => {
          const to = emailMap.get(ruc) || 'No encontrado';
          let body = emailTemplate;
          
          const firstRow = rows[0];
          Object.keys(firstRow).forEach(key => {
            const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            body = body.replace(placeholder, firstRow[key]);
          });
          
          const invoiceDetails = rows.map(row => `- Factura: ${row.NRO_FACTURA}, Monto: S/ ${Number(row.MONTO_DEUDA).toFixed(2)}, Vence: ${row.FECHA_VENCIMIENTO}`).join('\n');
          body = body.replace(/\{\{invoice_details\}\}/g, invoiceDetails);
          
          mockEmailFile.rows.forEach(emailRow => {
            if(emailRow.RUC === ruc) {
                 Object.keys(emailRow).forEach(key => {
                    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                    body = body.replace(placeholder, emailRow[key]);
                });
            }
          });

          return { to, body, recipient: firstRow.RAZON_SOCIAL || ruc };
        });

        setPreviews(generatedPreviews);
        setPreviewIndex(0);
        handleNextStep();
      } catch (error) {
        console.error("Preview generation failed:", error);
        toast({ title: "Error de Previsualización", description: "No se pudieron generar las vistas previas. Revisa el mapeo.", variant: "destructive" });
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 1: Subir Archivos de Excel</CardTitle>
              <CardDescription>Seleccione el archivo con los correos y el archivo con los datos para la combinación.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Modo de Simulación</AlertTitle>
                <AlertDescription>
                  Esta es una demostración. La carga de archivos está simulada con datos de ejemplo.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col md:flex-row gap-6 mt-6">
                <FileDropzone title="Archivo de Correos" description="Contiene RUC y Correo Electrónico." file={emailsFile} onFileSelect={() => setEmailsFile(mockEmailFile)} icon={MailPlus} />
                <FileDropzone title="Archivo de Datos" description="Contiene RUC y datos a combinar." file={dataFile} onFileSelect={() => setDataFile(mockDataFile)} icon={Columns} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNextStep} disabled={!emailsFile || !dataFile} className="ml-auto">
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 2: Mapear Columnas</CardTitle>
              <CardDescription>Relacione las columnas de sus archivos con los campos requeridos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Archivo de Correos ({emailsFile?.name})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-ruc">Columna con RUC del destinatario</Label>
                            <Select value={mappings.emailRuc} onValueChange={(v) => setMappings(m => ({...m, emailRuc: v}))}>
                                <SelectTrigger id="email-ruc"><SelectValue placeholder="Seleccionar columna..." /></SelectTrigger>
                                <SelectContent>{emailsFile?.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email-address">Columna con correo electrónico</Label>
                            <Select value={mappings.emailAddress} onValueChange={(v) => setMappings(m => ({...m, emailAddress: v}))}>
                                <SelectTrigger id="email-address"><SelectValue placeholder="Seleccionar columna..." /></SelectTrigger>
                                <SelectContent>{emailsFile?.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="border-t pt-6">
                    <h3 className="font-semibold mb-2">Archivo de Datos ({dataFile?.name})</h3>
                     <div className="space-y-2">
                        <Label htmlFor="data-ruc">Columna con RUC para cruzar datos</Label>
                        <Select value={mappings.dataRuc} onValueChange={(v) => setMappings(m => ({...m, dataRuc: v}))}>
                            <SelectTrigger id="data-ruc"><SelectValue placeholder="Seleccionar columna..." /></SelectTrigger>
                            <SelectContent>{dataFile?.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Atrás</Button>
              <Button onClick={handleNextStep} disabled={!mappings.emailRuc || !mappings.emailAddress || !mappings.dataRuc}>
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Paso 3: Crear Plantilla de Correo</CardTitle>
                    <CardDescription>Diseñe el correo que se enviará. Use placeholders para los datos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={emailTemplate}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        placeholder="Escriba su correo aquí..."
                        rows={15}
                        className="text-base"
                    />
                </CardContent>
            </Card>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Placeholders</CardTitle>
                        <CardDescription>Variables disponibles de sus archivos.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm max-h-32 overflow-y-auto">
                        <p className="font-semibold">Datos Generales:</p>
                        {allDataFields.map(f => <code key={f} className="block bg-muted p-1 rounded-sm my-1">&#123;&#123;{f}&#125;&#125;</code>)}
                        <p className="font-semibold mt-2">Datos de Correo:</p>
                        {emailsFile?.headers.map(f => <code key={f} className="block bg-muted p-1 rounded-sm my-1">&#123;&#123;{f}&#125;&#125;</code>)}
                        <p className="font-semibold mt-2">Detalles (Multi-línea):</p>
                        <code className="block bg-muted p-1 rounded-sm my-1">&#123;&#123;invoice_details&#125;&#125;</code>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="text-primary"/> Asistente con IA</CardTitle>
                        <CardDescription>Mejore su correo con inteligencia artificial.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="common-structures">Frases o ideas clave</Label>
                        <Textarea id="common-structures" value={commonStructures} onChange={(e) => setCommonStructures(e.target.value)} placeholder="Ej: Urgente, último aviso, etc." rows={2} />
                        <Button onClick={handleGenerateWithAI} disabled={isGenerating} className="w-full mt-4">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Mejorar con IA
                        </Button>
                    </CardContent>
                </Card>
                 <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Atrás</Button>
                    <Button onClick={handleGeneratePreviews} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                        Generar Vistas Previas
                    </Button>
                </div>
            </div>
          </div>
        );
       case 4:
        const currentPreview = previews[previewIndex];
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 4: Vista Previa y Envío</CardTitle>
              <CardDescription>Revise cada correo antes de enviarlo. Se encontraron {previews.length} destinatarios.</CardDescription>
            </CardHeader>
            <CardContent>
                {previews.length > 0 && currentPreview ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="font-medium">Destinatario {previewIndex + 1} de {previews.length}: <span className="font-normal text-muted-foreground">{currentPreview.recipient}</span></p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setPreviewIndex(p => Math.max(0, p - 1))} disabled={previewIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" onClick={() => setPreviewIndex(p => Math.min(previews.length - 1, p + 1))} disabled={previewIndex === previews.length - 1}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-card">
                            <p className="text-sm font-semibold">Para: <span className="font-normal">{currentPreview.to}</span></p>
                            <p className="text-sm font-semibold">Asunto: <span className="font-normal">Recordatorio de Pago</span></p>
                            <div className="border-t my-2"></div>
                            <div className="whitespace-pre-wrap text-sm">{currentPreview.body}</div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No hay vistas previas para mostrar.</p>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Atrás</Button>
              <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => toast({ title: 'Simulación', description: 'Función de descarga no implementada.'})}>
                      <Download className="mr-2 h-4 w-4"/> Descargar
                  </Button>
                  <Button onClick={() => toast({ title: 'Simulación', description: `Función de envío no implementada. Se enviarían ${previews.length} correos.`})}>
                      <Send className="mr-2 h-4 w-4"/> Enviar Correos
                  </Button>
              </div>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <StepIndicator currentStep={step} />
      {renderStep()}
    </div>
  );
}
