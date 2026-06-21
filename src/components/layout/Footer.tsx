export function Footer() {
  return (
    <footer className="border-t border-border py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          Financial Analytics Platform &copy; {new Date().getFullYear()}
        </p>
        <p>
          Datos provistos por Yahoo Finance, DolarAPI, y ArgentinaDatos
        </p>
      </div>
    </footer>
  );
}
