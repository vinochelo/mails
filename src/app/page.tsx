import { Header } from '@/components/header';
import MailMergeWizard from '@/components/mail-merge-wizard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <MailMergeWizard />
      </main>
      <footer className="py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Hecho con ❤️ por MailMergeXLS</p>
        </div>
      </footer>
    </div>
  );
}
