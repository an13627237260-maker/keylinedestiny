import { CosmicBackground } from "./CosmicBackground";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <CosmicBackground />
      <Header />
      <main
        className={`mx-auto w-full max-w-7xl flex-1 overflow-x-hidden px-3 pb-20 pt-[calc(var(--header-height)+1rem)] sm:px-4 md:pb-8 md:pt-[calc(var(--header-height)+1.5rem)] lg:px-8 ${className ?? ""}`}
      >
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
