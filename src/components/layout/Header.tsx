import { Scissors } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex items-center gap-2">
        <Scissors className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold text-foreground">
          ClaidCut
        </h1>
      </div>
    </header>
  );
}
