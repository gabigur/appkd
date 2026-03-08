import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Package, FileText, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

const tabs = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/orders", icon: Package, label: "Orders" },
  { path: "/documents", icon: FileText, label: "Docs" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
  { path: "/profile", icon: User, label: "Profile" },
];

const MobileLayout = ({ children, title, showBack }: MobileLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      {title && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="text-foreground p-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t max-w-md mx-auto">
        <div className="flex items-center justify-around py-2 px-1 safe-area-bottom">
          {tabs.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors min-w-[56px]",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
