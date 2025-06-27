import { Icons } from "@/components/icons";

export function Header() {
  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Icons.logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Asistente de Envios Masivos RM
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
