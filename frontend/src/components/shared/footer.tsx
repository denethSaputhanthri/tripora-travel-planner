export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40 py-8 text-sm text-muted-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-8">
        <p className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} Tripora. Travel planning made effortless.
        </p>
        <div className="flex gap-6">
          <span className="hover:text-foreground cursor-pointer">Destinations</span>
          <span className="hover:text-foreground cursor-pointer">Privacy</span>
          <span className="hover:text-foreground cursor-pointer">Terms</span>
        </div>
      </div>
    </footer>
  );
}
