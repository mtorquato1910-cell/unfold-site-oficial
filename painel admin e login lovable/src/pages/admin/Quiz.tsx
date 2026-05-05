import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field } from "@/components/admin/ui";
import { Plus, Pencil, Trash2, HelpCircle, X } from "lucide-react";
import { toast } from "sonner";

type Option = { label: string; score: number };

export default function Quiz() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [e, setE] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from("quiz_questions").select("*").order("display_order").order("created_at");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const opts: Option[] = e?.options ?? [];
  const setOpts = (o: Option[]) => setE({ ...e, options: o });

  const save = async () => {
    if (!e?.question) return toast.error("Pergunta obrigatória");
    const payload = {
      question: e.question, category: e.category ?? null,
      weight: e.weight ?? 1, options: e.options ?? [],
      display_order: e.display_order ?? 0, status: e.status ?? "active",
    };
    const r = e.id ? await supabase.from("quiz_questions").update(payload).eq("id", e.id) : await supabase.from("quiz_questions").insert(payload);
    if (r.error) return toast.error(r.error.message);
    toast.success("Salvo"); setOpen(false); setE(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Excluir questão?")) return;
    const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Diagnóstico" title="Questões do Quiz"
        description="Configure as perguntas do diagnóstico de maturidade, categorias e pontuação."
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setE(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setE({ status: "active", weight: 1, options: [{ label: "", score: 0 }] })} className="btn-premium h-9 rounded-lg">
                <Plus className="h-3.5 w-3.5" /> Nova questão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-mint-soft bg-[hsl(var(--sidebar-bg))]">
              <DialogHeader><DialogTitle>{e?.id ? "Editar" : "Nova"} questão</DialogTitle></DialogHeader>
              <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2">
                <Field label="Pergunta"><Textarea rows={2} value={e?.question ?? ""} onChange={(ev) => setE({ ...e, question: ev.target.value })} /></Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Categoria"><Input value={e?.category ?? ""} onChange={(ev) => setE({ ...e, category: ev.target.value })} placeholder="Ex: Estratégia" /></Field>
                  <Field label="Peso"><Input type="number" step="0.5" value={e?.weight ?? 1} onChange={(ev) => setE({ ...e, weight: +ev.target.value })} /></Field>
                  <Field label="Ordem"><Input type="number" value={e?.display_order ?? 0} onChange={(ev) => setE({ ...e, display_order: +ev.target.value })} /></Field>
                </div>
                <Field label="Status">
                  <Select value={e?.status ?? "active"} onValueChange={(v) => setE({ ...e, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">Ativa</SelectItem><SelectItem value="inactive">Inativa</SelectItem></SelectContent>
                  </Select>
                </Field>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim-2">Opções de resposta</label>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setOpts([...opts, { label: "", score: 0 }])}>
                      <Plus className="h-3 w-3" /> Opção
                    </Button>
                  </div>
                  {opts.map((o, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input className="flex-1" placeholder="Texto da opção" value={o.label} onChange={(ev) => { const c = [...opts]; c[idx] = { ...c[idx], label: ev.target.value }; setOpts(c); }} />
                      <Input type="number" className="w-24" placeholder="Pontos" value={o.score} onChange={(ev) => { const c = [...opts]; c[idx] = { ...c[idx], score: +ev.target.value }; setOpts(c); }} />
                      <Button size="icon" variant="ghost" onClick={() => setOpts(opts.filter((_, i) => i !== idx))}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save} className="btn-premium">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {items.length === 0 ? <EmptyState icon={HelpCircle} title="Nenhuma questão" description="Adicione perguntas para o diagnóstico de maturidade." /> : (
        <div className="space-y-3">
          {items.map((q, idx) => (
            <GlassCard key={q.id} className="glass-hover p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-4 min-w-0 flex-1">
                  <span className="font-display text-[28px] font-semibold tracking-tight text-primary/40 leading-none">{String(idx + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {q.category && <span className="font-mono text-[9px] uppercase tracking-wider text-primary/80 px-1.5 py-0.5 rounded bg-primary/10">{q.category}</span>}
                      <StatusBadge status={q.status} />
                      <span className="font-mono text-[10px] text-dim">peso {q.weight}</span>
                    </div>
                    <p className="text-[14px] font-medium leading-relaxed">{q.question}</p>
                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="mt-3 grid gap-1 sm:grid-cols-2">
                        {q.options.map((o: Option, i: number) => (
                          <div key={i} className="flex items-center justify-between text-[12px] text-dim-2 rounded-md border border-mint-soft bg-white/[0.02] px-2.5 py-1.5">
                            <span className="truncate">{o.label}</span>
                            <span className="font-mono text-primary/80">+{o.score}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setE(q); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del(q.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
