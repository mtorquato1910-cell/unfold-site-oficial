import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, FileText, Briefcase, MessageSquareQuote,
  FolderTree, Image as ImageIcon, Users, ClipboardList,
  HelpCircle, Sparkles as SparklesIcon, Bot,
  Settings, UserCog, Activity, LogOut, Search, Bell, Command, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Item = { to: string; label: string; icon: any; end?: boolean; admin?: boolean };
type Section = { label: string; items: Item[] };

const sections: Section[] = [
  {
    label: "Geral",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Conteúdo",
    items: [
      { to: "/admin/posts", label: "Posts / Blog", icon: FileText },
      { to: "/admin/cases", label: "Cases", icon: Briefcase },
      { to: "/admin/testimonials", label: "Depoimentos", icon: MessageSquareQuote },
      { to: "/admin/categories", label: "Categorias", icon: FolderTree },
      { to: "/admin/media", label: "Mídia", icon: ImageIcon },
    ],
  },
  {
    label: "Leads & CRM",
    items: [
      { to: "/admin/leads", label: "Leads", icon: Users },
      { to: "/admin/diagnostico", label: "Diagnósticos", icon: ClipboardList },
      { to: "/admin/quiz", label: "Questões do Quiz", icon: HelpCircle },
      { to: "/admin/insights", label: "Variações de Insights", icon: SparklesIcon },
      { to: "/admin/prompts", label: "Prompts de IA", icon: Bot },
    ],
  },
  {
    label: "Configurações",
    items: [
      { to: "/admin/settings", label: "Configurações do Site", icon: Settings, admin: true },
      { to: "/admin/users", label: "Usuários", icon: UserCog, admin: true },
      { to: "/admin/audit", label: "Log de Auditoria", icon: Activity, admin: true },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const allItems = sections.flatMap(s => s.items);
  const currentItem = allItems.find(i =>
    i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)
  );

  return (
    <div className="flex min-h-screen bg-aurora noise relative">
      {/* Sidebar */}
      <aside className="hidden md:flex sticky top-0 h-screen w-[260px] flex-col border-r border-mint-soft bg-[hsl(var(--sidebar-bg))]/80 backdrop-blur-xl z-20">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-mint-soft">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-md rounded-xl" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 ring-1 ring-primary/40">
              <SparklesIcon className="h-4 w-4 text-[hsl(var(--background))]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-tight tracking-tight">Unfold Growth</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim mt-0.5">Admin Console</div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => {
            const visible = section.items.filter(i => !i.admin || role === "admin");
            if (visible.length === 0) return null;
            return (
              <div key={section.label}>
                <div className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-dim/70">{section.label}</div>
                <nav className="flex flex-col gap-0.5">
                  {visible.map((item) => (
                    <NavLink
                      key={item.to} to={item.to} end={item.end}
                      className={({ isActive }) => cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-200",
                        isActive
                          ? "nav-active"
                          : "text-dim-2 hover:bg-white/[0.03] hover:text-foreground"
                      )}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={cn("h-[15px] w-[15px] shrink-0 transition-transform", isActive && "text-primary")} strokeWidth={1.75} />
                          <span className="font-medium">{item.label}</span>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_8px_hsl(158_92%_70%_/_0.6)]" />
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
            );
          })}
        </div>

        {/* User card */}
        <div className="p-3 border-t border-mint-soft">
          <div className="glass flex items-center gap-3 rounded-xl p-2.5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-primary/30 blur-sm rounded-full" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-[hsl(var(--background))] text-xs font-semibold ring-1 ring-primary/30">
                {(user?.email?.[0] ?? "U").toUpperCase()}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium">{user?.email?.split("@")[0]}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary/80">{role ?? "—"}</div>
            </div>
            <button onClick={signOut} className="rounded-md p-1.5 text-dim-2 hover:bg-white/5 hover:text-primary transition" title="Sair">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col relative">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-primary/[0.06] blur-[120px]" />

        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-mint-soft bg-[hsl(var(--background))]/70 px-6 backdrop-blur-2xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] min-w-0">
            <span className="text-dim font-mono uppercase tracking-[0.18em] text-[10px]">Unfold</span>
            <ChevronRight className="h-3 w-3 text-dim shrink-0" />
            <span className="font-medium truncate">{currentItem?.label ?? "Dashboard"}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
              <Input
                placeholder="Buscar…"
                className="h-8 w-72 border-mint-soft bg-white/[0.03] pl-9 pr-12 text-[12px] focus-visible:bg-white/[0.05]"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-dim">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </div>
            <button className="relative rounded-lg p-2 text-dim-2 hover:bg-white/5 hover:text-foreground transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(158_92%_70%)]" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 lg:px-10 animate-fade-in relative">{children}</main>
      </div>
    </div>
  );
}
