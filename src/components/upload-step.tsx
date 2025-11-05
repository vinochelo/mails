"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Users, FileText, ArrowRight, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadStepProps {
  onProcess: () => void;
  onRecipientsUpload: (file: File, startRow: number) => void;
  onInvoicesUpload: (file: File, startRow: number) => void;
  recipientFile: File | null;
  invoiceFile: File | null;
}

const FileUploader = ({ 
  title, 
  description, 
  icon: Icon, 
  onFileUpload,
  uploadedFile
}: { 
  title: string, 
  description: string, 
  icon: React.ElementType, 
  onFileUpload: (file: File, startRow: number) => void,
  uploadedFile: File | null
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
    <Card className="hover:border-primary/50 hover:shadow-lg transition-all flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-8 text-center flex-grow"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <>
              <FileCheck className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-foreground">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">{Math.round(uploadedFile.size / 1024)} KB</p>
              <Button variant="outline" size="sm" onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
                inputRef.current?.click()
              }}>
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
            onChange={(e) => setStartRow(parseInt(e.target.value, 10))}
            min="1"
            className="w-24"
          />
        </div>
      </CardContent>
    </Card>
  );
};


export function UploadStep({ onProcess, onRecipientsUpload, onInvoicesUpload, recipientFile, invoiceFile }: UploadStepProps) {
  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FileUploader 
            title="1. Archivo de Destinatarios"
            description="Debe contener: RUC, CODIGO, NOMBRE, CORREO."
            icon={Users}
            onFileUpload={onRecipientsUpload}
            uploadedFile={recipientFile}
        />
        <FileUploader 
            title="2. Archivo de Comprobantes"
            description="Debe contener: Tipo, serie, RUC, razón social, etc."
            icon={FileText}
            onFileUpload={onInvoicesUpload}
            uploadedFile={invoiceFile}
        />
      </div>
      <div className="mt-8 flex flex-col items-center">
        <Button size="lg" onClick={onProcess} disabled={!recipientFile || !invoiceFile}>
          Procesar Datos <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
         {(!recipientFile || !invoiceFile) && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
             Por favor, sube ambos archivos para continuar.
            </p>
         )}
      </div>
    </div>
  );
}
