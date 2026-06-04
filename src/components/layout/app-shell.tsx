type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--muted))_0%,hsl(var(--background))_18rem)] text-foreground">
      {children}
    </div>
  );
}
