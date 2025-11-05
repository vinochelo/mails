import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Users, FileText, ArrowRight } from "lucide-react";

interface UploadStepProps {
  onProcess: () => void;
}

export function UploadStep({ onProcess }: UploadStepProps) {
  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="hover:border-primary/50 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>1. Archivo de Destinatarios</CardTitle>
                <CardDescription>Debe contener: RUC, código, nombre, correo.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-8 text-center">
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Arrastra y suelta tu archivo aquí.</p>
              <Button variant="outline">Seleccionar archivo</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary/50 hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-start gap-4">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>2. Archivo de Comprobantes</CardTitle>
                <CardDescription>Debe contener: Tipo, serie, RUC, razón social, etc.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-8 text-center">
               <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Arrastra y suelta tu archivo aquí.</p>
              <Button variant="outline">Seleccionar archivo</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 flex flex-col items-center">
        <Button size="lg" onClick={onProcess}>
          Procesar Datos de Ejemplo <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          (Para esta demostración, haga clic para usar datos de ejemplo)
        </p>
      </div>
    </div>
  );
}
