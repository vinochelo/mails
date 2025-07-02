"use client";

import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, FileCheck2, Columns, MailPlus, Sparkles, Eye, Download, ChevronRight, ChevronLeft, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { emailAutocompletion } from '@/ai/flows/email-autocompletion';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ParsedFileData = {
  name: string;
  size: number;
  headers: string[];
  rows: any[];
};

interface FileDropzoneProps {
  title: string;
  file: ParsedFileData | null;
  onFileSelect: (file: File) => void;
  icon: React.ElementType;
  description: string;
  isLoading: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ title, file, onFileSelect, icon: Icon, description, isLoading }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onFileSelect(event.target.files[0]);
        }
        if(inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleAreaClick = () => {
        if (!isLoading) {
            inputRef.current?.click();
        }
    };

    return (
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
            <input
              type="file"
              ref={inputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".xlsx, .xls"
              disabled={isLoading}
            />
            <div 
              className={cn(
                "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg h-48",
                !isLoading && "cursor-pointer hover:border-primary"
              )}
              onClick={handleAreaClick}
            >
              {isLoading ? (
                  <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-2" />
                      <p className="text-muted-foreground">Procesando archivo...</p>
                  </div>
              ) : file ? (
                <div className="text-center">
                  <FileCheck2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
                  <p className="font-semibold text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  <Button variant="link" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); handleAreaClick(); }}>
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Haz clic para subir un archivo</p>
                  <Button onClick={(e) => { e.stopPropagation(); handleAreaClick(); }}>Seleccionar Archivo</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
};

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { num: 1, title: 'Subir Archivos', icon: UploadCloud },
    { num: 2, title: 'Mapear Columnas', icon: Columns },
    { num: 3, title: 'Crear Correo', icon: MailPlus },
    { num: 4, title: 'Vista Previa y Envío', icon: Download },
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
  const [emailsFile, setEmailsFile] = useState<ParsedFileData | null>(null);
  const [dataFile, setDataFile] = useState<ParsedFileData | null>(null);
  const [isParsingEmails, setIsParsingEmails] = useState(false);
  const [isParsingData, setIsParsingData] = useState(false);
  const [mappings, setMappings] = useState({ emailRuc: '', emailAddress: '', dataRuc: '' });
  const [emailTemplate, setEmailTemplate] = useState('Estimados señores de {{NOMBRE}},\n\nPor medio de la presente, nos dirigimos a ustedes con el fin de solicitar la anulación de los siguientes comprobantes registrados en el SRI.\n\nEl motivo de la presente solicitud de anulación, junto con el detalle de los comprobantes, se encuentra a continuación:\n\n{{RAZON_SOCIAL_EMISOR}} | {{RUC}}\n\n{{invoice_details}}\n\nAgradecemos de antemano su pronta gestión y colaboración.\n\nSaludos cordiales,\n\nVinicio Velastegui\nContabilidad        \nQuito - Ecuador\nTelf: 023976200 / 022945950 Ext: 1405\nVinicio.velastegui@modarm.com');
  const [commonStructures, setCommonStructures] = useState('Solicitud de anulación. Anular facturas SRI. Motivo de anulación.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previews, setPreviews] = useState<{ to: string, body: string, recipient: string }[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { toast } = useToast();

  const handleNextStep = () => setStep(s => Math.min(s + 1, 4));
  const handlePrevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const allDataFields = useMemo(() => {
    if (!dataFile) return [];
    return dataFile.headers.filter(h => h !== mappings.dataRuc);
  }, [dataFile, mappings.dataRuc]);

  const parseExcelFile = (file: File): Promise<ParsedFileData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const headers = ((XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] || []) as string[]).map(h => String(h).trim());
                if(headers.length === 0) {
                    throw new Error("El archivo parece estar vacío o no tiene cabeceras.");
                }
                const rows = XLSX.utils.sheet_to_json(worksheet);

                resolve({
                    name: file.name,
                    size: file.size,
                    headers,
                    rows,
                });
            } catch (error) {
                console.error("File parsing error:", error);
                reject(new Error("No se pudo procesar el archivo. Asegúrate de que es un archivo Excel válido con cabeceras."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
  };

  const handleEmailFileSelect = async (file: File) => {
    if (!file) return;
    setIsParsingEmails(true);
    try {
        const parsedData = await parseExcelFile(file);
        setEmailsFile(parsedData);
    } catch (error) {
        toast({ title: "Error al leer archivo de correos", description: (error as Error).message, variant: "destructive" });
        setEmailsFile(null);
    } finally {
        setIsParsingEmails(false);
    }
  };

  const handleDataFileSelect = async (file: File) => {
      if (!file) return;
      setIsParsingData(true);
      try {
          const parsedData = await parseExcelFile(file);
          setDataFile(parsedData);
      } catch (error) {
          toast({ title: "Error al leer archivo de datos", description: (error as Error).message, variant: "destructive" });
          setDataFile(null);
      } finally {
          setIsParsingData(false);
      }
  };

  const handleGenerateWithAI = async () => {
    if (!emailTemplate) {
      toast({ title: "Error", description: "El cuerpo del correo no puede estar vacío.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await emailAutocompletion({ template: emailTemplate, commonStructures });
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
     if (!emailsFile || !dataFile || !mappings.emailRuc || !mappings.emailAddress || !mappings.dataRuc) {
        toast({ title: "Faltan datos", description: "Asegúrate de cargar ambos archivos y mapear las columnas requeridas.", variant: "destructive" });
        return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const emailMap = new Map(emailsFile.rows.map(row => [String(row[mappings.emailRuc]), row[mappings.emailAddress]]));
        
        const dataByRuc = dataFile.rows.reduce((acc, row) => {
          const ruc = String(row[mappings.dataRuc]);
          if (!acc[ruc]) acc[ruc] = [];
          acc[ruc].push(row);
          return acc;
        }, {} as Record<string, any[]>);

        const generatedPreviews = Object.entries(dataByRuc).map(([ruc, rows]) => {
          let body = emailTemplate;
          
          const firstRow = rows[0];
          Object.entries(firstRow).forEach(([key, value]) => {
            const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            body = body.replace(placeholder, String(value));
          });
          
          const invoiceDetails = rows.map(row => `  • ${row['TIPO_COMP'] || ''} ${row['SERIE_COMPROBANTE'] || ''}: ${row['OBSERVACIONES'] || ''}`).join('\n');
          body = body.replace(/\{\{invoice_details\}\}/g, invoiceDetails);
          
          const emailRow = emailsFile.rows.find(eRow => String(eRow[mappings.emailRuc]) === ruc);
          let recipientName = ruc;
          let to = emailMap.get(ruc) || 'Correo no encontrado';
          if (emailRow) {
            Object.entries(emailRow).forEach(([key, value]) => {
              const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
              body = body.replace(placeholder, String(value));
            });
            recipientName = emailRow['NOMBRE'] || ruc;
          }

          return { to, body, recipient: recipientName };
        }).filter(p => p.to !== 'Correo no encontrado' && p.to.includes('@'));

        if (generatedPreviews.length === 0) {
            toast({ title: "Sin coincidencias", description: "No se encontraron RUCs que coincidan entre los dos archivos o los correos son inválidos.", variant: "destructive" });
        } else {
            setPreviews(generatedPreviews);
            setPreviewIndex(0);
            handleNextStep();
        }
      } catch (error) {
        console.error("Preview generation failed:", error);
        toast({ title: "Error de Previsualización", description: "No se pudieron generar las vistas previas. Revisa el mapeo y el contenido de los archivos.", variant: "destructive" });
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  const handleDownload = () => {
    if (previews.length === 0) {
      toast({ title: 'Nada para descargar', description: 'No se han generado correos para descargar.', variant: 'destructive' });
      return;
    }

    const csvHeader = ['"Destinatario"', '"Para"', '"Asunto"', '"Cuerpo"'];
    const csvRows = previews.map(p => {
      const recipient = `"${p.recipient.replace(/"/g, '""')}"`;
      const to = `"${p.to.replace(/"/g, '""')}"`;
      const subject = `"Solicitud de Anulación de Facturas"`;
      const body = `"${p.body.replace(/"/g, '""')}"`;
      return [recipient, to, subject, body].join(',');
    });

    const csvContent = [csvHeader.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'correos_generados.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    toast({ title: 'Descarga Iniciada', description: 'El archivo CSV con los correos se está descargando.' });
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
              <div className="flex flex-col md:flex-row gap-6 mt-6">
                <FileDropzone title="Archivo de Correos" description="Contiene RUC, Nombre y Correo." file={emailsFile} onFileSelect={handleEmailFileSelect} icon={MailPlus} isLoading={isParsingEmails} />
                <FileDropzone title="Archivo de Datos" description="Contiene RUC y datos a combinar." file={dataFile} onFileSelect={handleDataFileSelect} icon={Columns} isLoading={isParsingData} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNextStep} disabled={!emailsFile || !dataFile || isParsingEmails || isParsingData} className="ml-auto">
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
                                <SelectContent>{emailsFile?.headers.map((h, i) => <SelectItem key={`email-ruc-${h}-${i}`} value={h}>{h}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email-address">Columna con correo electrónico</Label>
                            <Select value={mappings.emailAddress} onValueChange={(v) => setMappings(m => ({...m, emailAddress: v}))}>
                                <SelectTrigger id="email-address"><SelectValue placeholder="Seleccionar columna..." /></SelectTrigger>
                                <SelectContent>{emailsFile?.headers.map((h, i) => <SelectItem key={`email-address-${h}-${i}`} value={h}>{h}</SelectItem>)}</SelectContent>
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
                            <SelectContent>{dataFile?.headers.map((h, i) => <SelectItem key={`data-ruc-${h}-${i}`} value={h}>{h}</SelectItem>)}</SelectContent>
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
          <>
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
                  <CardContent className="text-sm max-h-[450px] overflow-y-auto">
                    <p className="font-semibold">Datos Generales:</p>
                    {allDataFields.map((f, i) => <code key={`placeholder-data-${f}-${i}`} className="block bg-muted p-1 rounded-sm my-1">&#123;&#123;{f}&#125;&#125;</code>)}
                    <p className="font-semibold mt-2">Datos de Correo:</p>
                    {emailsFile?.headers.map((f, i) => <code key={`placeholder-email-${f}-${i}`} className="block bg-muted p-1 rounded-sm my-1">&#123;&#123;{f}&#125;&#125;</code>)}
                    <p className="font-semibold mt-2">Detalles (Multi-línea):</p>
                    <code className="block bg-muted p-1 rounded-sm my-1">&#123;&#123;invoice_details&#125;&#125;</code>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="text-primary"/> Asistente con IA</CardTitle>
                <CardDescription>Mejore su correo con inteligencia artificial. La IA refinará el texto basándose en sus ideas clave, manteniendo intactos los placeholders.</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="common-structures">Frases o ideas clave</Label>
                <Textarea id="common-structures" value={commonStructures} onChange={(e) => setCommonStructures(e.target.value)} placeholder="Ej: Urgente, último aviso, etc." rows={2} />
                <Button onClick={handleGenerateWithAI} disabled={isGenerating} className="w-full sm:w-auto mt-4">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Mejorar con IA
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-6 border-t pt-6">
              <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Atrás</Button>
              <Button onClick={handleGeneratePreviews} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                Generar Vistas Previas
              </Button>
            </div>
          </>
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
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="font-medium">Destinatario {previewIndex + 1} de {previews.length}: <span className="font-normal text-muted-foreground">{currentPreview.recipient}</span></p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setPreviewIndex(p => Math.max(0, p - 1))} disabled={previewIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" onClick={() => setPreviewIndex(p => Math.min(previews.length - 1, p + 1))} disabled={previewIndex === previews.length - 1}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-muted/30">
                            <p className="text-sm font-semibold">Para: <span className="font-normal">{currentPreview.to}</span></p>
                            <p className="text-sm font-semibold">Asunto: <span className="font-normal">Solicitud de Anulación de Facturas</span></p>
                            <div className="border-t my-2"></div>
                            <div className="whitespace-pre-wrap text-sm">{currentPreview.body}</div>
                        </div>

                        <Card className="bg-blue-50 border-blue-200">
                          <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                                <HelpCircle />
                                ¿Cómo enviar los correos?
                              </CardTitle>
                              <CardDescription className="text-blue-600 pt-2">
                                El archivo <strong>correos_generados.csv</strong> que descargaste está listo para usarse con herramientas de envío masivo. Selecciona tu cliente de correo para ver las instrucciones:
                              </CardDescription>
                          </CardHeader>
                          <CardContent className="text-blue-700 pt-0">
                            <Tabs defaultValue="google-sheets" className="w-full">
                              <TabsList className="grid w-full grid-cols-2 bg-blue-100">
                                <TabsTrigger value="google-sheets">Google / Gmail</TabsTrigger>
                                <TabsTrigger value="outlook">Outlook</TabsTrigger>
                              </TabsList>
                              <TabsContent value="google-sheets" className="mt-4">
                                <p className="font-semibold">Guía Detallada para Enviar con Mailmeteor</p>
                                <p className="text-sm mt-1">Esta es la forma más sencilla y recomendada. Mailmeteor te permite enviar hasta 75 correos al día gratis.</p>
                                <ol className="list-decimal list-inside space-y-3 pl-2 mt-3 text-sm">
                                    <li>
                                        <strong>Sube tu archivo a Google Sheets</strong>: Abre una nueva Hoja de Cálculo de Google y ve a <strong>Archivo &gt; Importar</strong>. Selecciona el archivo <code>correos_generados.csv</code> que descargaste.
                                    </li>
                                    <li>
                                        <strong>Instala el complemento</strong>: Desde el menú, ve a <strong>Extensiones &gt; Complementos &gt; Descargar complementos</strong>. Busca e instala <a href="https://workspace.google.com/marketplace/app/mailmeteor_mail_merge_for_gmail/1008273617323" target="_blank" rel="noopener noreferrer" className="underline font-medium">Mailmeteor</a>.
                                    </li>
                                    <li>
                                        <strong>Inicia Mailmeteor</strong>: Una vez instalado, ve a <strong>Extensiones &gt; Mailmeteor &gt; Abrir Mailmeteor</strong>. Se abrirá un panel a la derecha de tu pantalla.
                                    </li>
                                    <li>
                                        <strong>Configura la Plantilla</strong>: Mailmeteor es inteligente y debería detectar tus columnas.
                                        <ul className="list-disc list-inside pl-4 mt-2 space-y-2">
                                            <li>El campo <strong>"Email column"</strong> debería seleccionar automáticamente la columna <code>Para</code>.</li>
                                            <li>Haz clic en el botón <strong>"Create new template"</strong>.</li>
                                            <li>En la nueva ventana, para el <strong>Asunto</strong> (Subject), borra el contenido y haz clic en el botón <strong>&#123;+ Insert variable&#125;</strong>. Selecciona <strong>Asunto</strong>. El campo debería mostrar <code>&#123;&#123;Asunto&#125;&#125;</code>.</li>
                                            <li>En el <strong>Cuerpo del correo</strong>, borra todo el texto, vuelve a hacer clic en <strong>&#123;+ Insert variable&#125;</strong> y selecciona <strong>Cuerpo</strong>. El campo debería mostrar <code>&#123;&#123;Cuerpo&#125;&#125;</code>.</li>
                                            <li>Guarda la plantilla.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <strong>¡Envía!</strong>
                                        <ul className="list-disc list-inside pl-4 mt-2 space-y-2">
                                            <li>De vuelta en el panel principal de Mailmeteor, puedes hacer clic en <strong>"Send a test email"</strong> para enviarte una prueba y verificar que todo está correcto.</li>
                                            <li>Cuando estés listo, presiona el gran botón azul <strong>"Send emails"</strong> para iniciar el envío a toda tu lista.</li>
                                        </ul>
                                    </li>
                                </ol>
                                <p className="text-xs italic mt-4 text-blue-600">Si Mailmeteor no te funciona, puedes probar <a href="https://workspace.google.com/marketplace/app/yet_another_mail_merge_mail_merge_for_gm/520629572273" target="_blank" rel="noopener noreferrer" className="underline font-medium">Yet Another Mail Merge (YAMM)</a>, aunque su límite gratuito es más bajo (20 correos/día).</p>
                              </TabsContent>
                              <TabsContent value="outlook" className="mt-4">
                                <p className="font-semibold">Opción 2: Usar Word y Outlook (Nativo)</p>
                                <p className="text-sm mt-1">Este método usa la función de "Combinar correspondencia" de Microsoft Office. No tiene los límites de los complementos, usarás los límites de tu propia cuenta de Outlook (que suelen ser mucho más altos).</p>
                                <ol className="list-decimal list-inside space-y-2 pl-2 mt-3">
                                  <li>Abre un documento en <strong>Microsoft Word</strong> (no en Outlook).</li>
                                  <li>Ve a la pestaña <strong>Correspondencia &gt; Iniciar Combinación de correspondencia &gt; Mensajes de correo electrónico</strong>.</li>
                                  <li>Haz clic en <strong>Seleccionar destinatarios &gt; Usar una lista existente...</strong> y elige el archivo <strong>correos_generados.csv</strong>.</li>
                                  <li>En la pestaña Correspondencia, haz clic en <strong>Insertar campo combinado</strong> y selecciona <strong>Cuerpo</strong>. Esto insertará el cuerpo completo del correo en tu documento.</li>
                                  <li>Haz clic en <strong>Finalizar y combinar &gt; Enviar mensajes de correo electrónico...</strong>.</li>
                                  <li>En la ventana que aparece:
                                    <ul className="list-disc list-inside pl-4 mt-1">
                                      <li>En el campo <strong>"Para:"</strong>, asegúrate de que esté seleccionada la columna <strong>Para</strong>.</li>
                                      <li>En <strong>"Línea de asunto:"</strong>, selecciona la columna <strong>Asunto</strong>.</li>
                                      <li>Haz clic en <strong>Aceptar</strong>. Outlook enviará los correos.</li>
                                    </ul>
                                  </li>
                                </ol>
                                <p className="text-xs italic mt-2 text-blue-600">Nota: La apariencia del correo (saltos de línea, etc.) dependerá de cómo Word interprete el texto. La opción con los complementos de Google Sheets suele dar resultados más fiables con cuerpos de texto complejos.</p>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No hay vistas previas para mostrar.</p>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-6">
              <Button variant="outline" onClick={handlePrevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Atrás
              </Button>
              <Button onClick={handleDownload} disabled={previews.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Descargar CSV para Envío
              </Button>
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
