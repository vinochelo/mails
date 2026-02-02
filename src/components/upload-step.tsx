
"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Users, FileText, ArrowRight, FileCheck, Calendar, Database, Trash2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UploadStepProps {
  onProcess: () => void;
  onRecipientsUpload: (file: File, startRow: number) => void;
  onInvoicesUpload: (file: File, startRow: number) => void;
  recipientFile: File | null;
  invoiceFile: File | null;
  recipientsCount: number;
  lastRecipientsUpdate: string | null;
  onClearRecipients: () => void;
}

const FileUploader = ({ 
  title, 
  description, 
  icon: Icon, 
  onFileUpload,
  uploadedFile,
  isRecipientUploader = false,
  hasStoredData = false
}: { 
  title: string, 
  description: string, 
  icon: React.ElementType, 
  onFileUpload: (file: File, startRow: number) => void,
  uploadedFile: File | null,
  isRecipientUploader?: boolean,
  hasStoredData?: boolean
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [startRow, setStartRow] = useState(2);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file, startRow);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file, startRow);
    }
  };

  return (
    <Card className={cn(
      "hover:border-primary/50 hover:shadow-lg transition-all flex flex-col border-2",
      isRecipientUploader && hasStoredData ? "bg-primary/5 border-primary/20" : ""
    )}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
            isRecipientUploader && hasStoredData ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-8 text-center flex-grow transition-colors",
            uploadedFile ? "border-green-500/50 bg-green-50/10" : "hover:bg-muted/50"
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <>
              <FileCheck className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-foreground">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">{Math.round(uploadedFile.size / 1024)} KB</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => inputRef.current?.click()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Cambiar archivo
              </Button>
            </>
          ) : (
            <>
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Arrastra y suelta tu archivo aquí.</p>
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                Seleccionar archivo
              </Button>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
          <Label htmlFor={`start-row-${title.replace(/\s+/g, '-')}`}>Fila de inicio de datos</Label>
          <Input 
            type="number" 
            id={`start-row-${title.replace(/\s+/g, '-')}`}
            value={startRow}
            onChange={(e) => {
              const row = parseInt(e.target.value, 10);
              setStartRow(row > 0 ? row : 1);
              if (uploadedFile) {
                  onFileUpload(uploadedFile, row > 0 ? row : 1);
              }
            }}
            min="1"
            className="w-24"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export function UploadStep({ 
  onProcess, 
  onRecipientsUpload, 
  onInvoicesUpload, 
  recipientFile, 
  invoiceFile,
  recipientsCount,
  lastRecipientsUpdate,
  onClearRecipients
}: UploadStepProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (lastRecipientsUpdate) {
      try {
        const date = new Date(lastRecipientsUpdate);
        setFormattedDate(format(date, "EEEE, d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }));
      } catch (e) {
        setFormattedDate("Fecha no válida");
      }
    } else {
      setFormattedDate(null);
    }
  }, [lastRecipientsUpdate]);

  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black font-headline tracking-tight">Carga de Datos</h2>
        <p className="text-muted-foreground mt-2 text-lg">Prepara tu base de destinatarios y los comprobantes para procesar.</p>
      </div>

      {lastRecipientsUpdate && (
        <Card className="mb-10 border-2 border-primary/20 shadow-xl overflow-hidden">
          <div className="bg-primary/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                <Database className="h-10 w-10" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-1">Base de Datos Guardada</h3>
                <p className="text-3xl font-black font-headline text-foreground leading-tight">
                  {recipientsCount} Destinatarios listos
                </p>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>Actualizado el: <span className="text-foreground font-bold">{formattedDate}</span></span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={onClearRecipients} className="border-2 font-bold hover:bg-destructive hover:text-white transition-all">
                <Trash2 className="mr-2 h-4 w-4" />
                Borrar del navegador
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FileUploader 
            title={lastRecipientsUpdate ? "Actualizar Destinatarios" : "1. Archivo de Destinatarios"}
            description="Carga el listado de RUCs y correos de contacto."
            icon={Users}
            onFileUpload={onRecipientsUpload}
            uploadedFile={recipientFile}
            isRecipientUploader={true}
            hasStoredData={!!lastRecipientsUpdate}
        />
        <FileUploader 
            title="2. Archivo de Comprobantes"
            description="Carga el detalle de facturas o notas de crédito."
            icon={FileText}
            onFileUpload={onInvoicesUpload}
            uploadedFile={invoiceFile}
        />
      </div>

      <div className="mt-12 flex flex-col items-center">
        <Button 
          size="lg" 
          onClick={onProcess} 
          disabled={(recipientsCount === 0 && !recipientFile) || !invoiceFile}
          className="h-16 px-12 text-xl font-black shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          {recipientsCount > 0 ? "Procesar con Base Guardada" : "Procesar Archivos"}
          <ArrowRight className="ml-3 h-6 w-6" />
        </Button>
         {((recipientsCount === 0 && !recipientFile) || !invoiceFile) && (
            <p className="mt-6 text-center font-bold text-muted-foreground flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Sube los archivos necesarios para desbloquear este paso.
            </p>
         )}
      </div>
    </div>
  );
}
