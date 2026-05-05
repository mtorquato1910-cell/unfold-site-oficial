import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard, StatCard } from "@/components/admin/ui";
import {
  FileText, Briefcase, Users, ClipboardList, ArrowUpRight,
  Sparkles, TrendingUp, MessageSquareQuote, Plus
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ posts: 0, cases: 0, leads: 0, diag: 0, testi: 0, prompts: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentDiag, setRecentDiag] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [posts, cases, leads, diag, testi, prompts, recentL, recentD] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("cases").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("diagnostico_results").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("ai_prompts").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id, name, email, status, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("diagnostico_results").select("id, company, score, maturity_level, created_at").order("created_at", { ascending: false }).limit(4),
      ]);
      setStats({
        posts: posts.count ?? 0, cases: cases.count ?? 0,
        leads: leads.count ?? 0, diag: diag.count ?? 0,
        testi: testi.count ?? 0, prompts: prompts.count ?? 0,
      });
      setRecentLeads(recentL.data ?? []);
      setRecentDiag(recentD.data ?? []);
    })();
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  return (
    <div className="max-w-7xl">
      {/* Hero */}
      <div className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80 mb-3 flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-display text-[44px] sm:text-[52px] font-semibold tracking-[-0.03em] leading-[1.05]">
          {greeting}, <span className="text-gradient-mint">{name}</span>.
        </h1>
        <p className="mt-3 text-[15px] text-dim-2 max-w-xl leading-relaxed">
          Aqui está o resumo do seu conteúdo, leads e diagnósticos da Unfold Growth.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-10">
        <StatCard label="Posts" value={stats.posts} hint="Blog & artigos" />
        <StatCard label="Cases" value={stats.cases} hint="Histórias de sucesso" />
        <StatCard label="Leads" value={stats.leads} hint="Capturados" trend="" />
        <StatCard label="Diagnósticos" value={stats.diag} hint="Quiz preenchidos" />
        <StatCard label="Depoimentos" value={stats.testi} />
        <StatCard label="Prompts IA" value={stats.prompts} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent leads */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-[17px] font-medium tracking-tight">Leads recentes</h3>
              <p className="text-[12px] text-dim-2 mt-0.5">Últimos contatos capturados pelo site</p>
            </div>
            <Link to="/admin/leads" className="text-[11px] text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium">
              Ver todos <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <div className="text-center py-12 text-[13px] text-dim">Nenhum lead ainda</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentLeads.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs font-semibold ring-1 ring-primary/15">
                      {l.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{l.name}</div>
                      <div className="text-[11px] text-dim truncate">{l.email}</div>
                    </div>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-primary/80">{l.status}</div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Quick actions */}
        <GlassCard>
          <h3 className="font-display text-[17px] font-medium tracking-tight mb-4">Atalhos</h3>
          <div className="space-y-1">
            {[
              { i: FileText, l: "Novo post", h: "/admin/posts" },
              { i: Briefcase, l: "Novo case", h: "/admin/cases" },
              { i: MessageSquareQuote, l: "Novo depoimento", h: "/admin/testimonials" },
              { i: Users, l: "Ver leads", h: "/admin/leads" },
              { i: ClipboardList, l: "Diagnósticos", h: "/admin/diagnostico" },
            ].map((s, idx) => (
              <Link key={idx} to={s.h} className="group flex items-center gap-3 rounded-lg p-2.5 -mx-2.5 transition-all hover:bg-white/[0.04]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 group-hover:bg-primary/15 transition">
                  <s.i className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>
                <span className="text-[13px] flex-1 font-medium">{s.l}</span>
                <ArrowUpRight className="h-3 w-3 text-dim opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* Recent diagnostics */}
        <GlassCard className="lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-[17px] font-medium tracking-tight">Diagnósticos recentes</h3>
              <p className="text-[12px] text-dim-2 mt-0.5">Últimos resultados de maturidade</p>
            </div>
            <Link to="/admin/diagnostico" className="text-[11px] text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium">
              Ver todos <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentDiag.length === 0 ? (
            <div className="text-center py-12 text-[13px] text-dim">Nenhum diagnóstico ainda</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {recentDiag.map((d) => (
                <div key={d.id} className="rounded-xl border border-mint-soft bg-white/[0.02] p-4 hover:bg-white/[0.04] transition">
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-2">{d.maturity_level ?? "—"}</div>
                  <div className="text-[14px] font-medium truncate">{d.company}</div>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="font-display text-[28px] font-semibold tracking-tight text-primary leading-none">{d.score}</span>
                    <span className="font-mono text-[9px] text-dim">{new Date(d.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
