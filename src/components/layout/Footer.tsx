export default function Footer() {
  return (
    <footer className="py-6 px-4 md:px-8 border-t border-border mt-12">
      <div className="container mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ClaidCut. Powered by AI.
        </p>
      </div>
    </footer>
  );
}
