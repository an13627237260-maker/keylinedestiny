import { CosmicBackground } from "./CosmicBackground";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <CosmicBackground />
      <Header />
      <main
        className={`mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-[calc(var(--header-height)+1.5rem)] lg:px-8 ${className ?? ""}`}
      >
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
