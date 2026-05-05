import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field } from "@/components/admin/ui";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Insights() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [e, setE] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from("insight_variations").select("*").order("min_score");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!e?.title || !e?.content || !e?.maturity_level) return toast.error("Preencha título, nível e conteúdo");
    const payload = {
      title: e.title, maturity_level: e.maturity_level, category: e.category ?? null,
      min_score: e.min_score ?? 0, max_score: e.max_score ?? 100,
      content: e.content, recommendations: e.recommendations ?? null,
      status: e.status ?? "active",
    };
    const r = e.id ? await supabase.from("insight_variations").update(payload).eq("id", e.id) : await supabase.from("insight_variations").insert(payload);
    if (r.error) return toast.error(r.error.message);
    toast.success("Salvo"); setOpen(false); setE(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Excluir?")) return;
    const { error } = await supabase.from("insight_variations").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Diagnóstico" title="Variações de Insights"
        description="Textos de retorno gerados ao final do diagnóstico, por nível de maturidade e faixa de pontuação."
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setE(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setE({ status: "active", min_score: 0, max_score: 100, maturity_level: "iniciante" })} className="btn-premium h-9 rounded-lg">
                <Plus className="h-3.5 w-3.5" /> Nova variação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-mint-soft bg-[hsl(var(--sidebar-bg))]">
              <DialogHeader><DialogTitle>{e?.id ? "Editar" : "Nova"} variação</DialogTitle></DialogHeader>
              <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2">
                <Field label="Título"><Input value={e?.title ?? ""} onChange={(ev) => setE({ ...e, title: ev.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nível de maturidade">
                    <Select value={e?.maturity_level ?? "iniciante"} onValueChange={(v) => setE({ ...e, maturity_level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                        <SelectItem value="especialista">Especialista</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Categoria"><Input value={e?.category ?? ""} onChange={(ev) => setE({ ...e, category: ev.target.value })} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Score mínimo"><Input type="number" value={e?.min_score ?? 0} onChange={(ev) => setE({ ...e, min_score: +ev.target.value })} /></Field>
                  <Field label="Score máximo"><Input type="number" value={e?.max_score ?? 100} onChange={(ev) => setE({ ...e, max_score: +ev.target.value })} /></Field>
                </div>
                <Field label="Conteúdo do insight"><Textarea rows={5} value={e?.content ?? ""} onChange={(ev) => setE({ ...e, content: ev.target.value })} /></Field>
                <Field label="Recomendações"><Textarea rows={3} value={e?.recommendations ?? ""} onChange={(ev) => setE({ ...e, recommendations: ev.target.value })} /></Field>
                <Field label="Status">
                  <Select value={e?.status ?? "active"} onValueChange={(v) => setE({ ...e, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">Ativo</SelectItem><SelectItem value="inactive">Inativo</SelectItem></SelectContent>
                  </Select>
                </Field>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save} className="btn-premium">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {items.length === 0 ? <EmptyState icon={Sparkles} title="Nenhuma variação" description="Crie textos para cada nível de maturidade do diagnóstico." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((v) => (
            <GlassCard key={v.id} className="glass-hover">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary/80 mb-1">{v.maturity_level}{v.category && ` · ${v.category}`}</div>
                  <h3 className="font-display text-[16px] font-medium tracking-tight">{v.title}</h3>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StatusBadge status={v.status} />
                  <div className="font-mono text-[10px] text-dim">{v.min_score}–{v.max_score} pts</div>
                </div>
              </div>
              <p className="text-[12px] text-dim-2 line-clamp-3 leading-relaxed">{v.content}</p>
              <div className="mt-4 flex justify-end gap-1 border-t border-white/[0.04] pt-3">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setE(v); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del(v.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
