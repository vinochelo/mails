import { LogoIcon } from '@/components/icons/logo-icon';

export function Header() {
  return (
    <header className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center gap-4">
        <LogoIcon className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground">
          MassMailer Pro
        </h1>
      </div>
      <p className="mt-3 text-center text-lg text-muted-foreground">
        Importe sus datos, redacte correos electrónicos y envíelos en masa.
      </p>
    </header>
  );
}
