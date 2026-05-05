import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, GlassCard, StatusBadge, EmptyState, Field } from "@/components/admin/ui";
import { Plus, Pencil, Trash2, Bot, Copy } from "lucide-react";
import { toast } from "sonner";

const MODELS = [
  "google/gemini-2.5-flash", "google/gemini-2.5-pro",
  "google/gemini-2.5-flash-lite", "openai/gpt-5", "openai/gpt-5-mini",
];

export default function Prompts() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [e, setE] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from("ai_prompts").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!e?.name || !e?.content) return toast.error("Nome e conteúdo obrigatórios");
    const payload = {
      name: e.name, category: e.category ?? null, description: e.description ?? null,
      content: e.content, model: e.model ?? "google/gemini-2.5-flash",
      status: e.status ?? "active", variables: e.variables ?? [],
    };
    const r = e.id ? await supabase.from("ai_prompts").update(payload).eq("id", e.id) : await supabase.from("ai_prompts").insert(payload);
    if (r.error) return toast.error(r.error.message);
    toast.success("Salvo"); setOpen(false); setE(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Excluir prompt?")) return;
    const { error } = await supabase.from("ai_prompts").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };
  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copiado"); };

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="IA" title="Prompts de IA"
        description="Biblioteca de prompts reutilizáveis para integrações com modelos de IA. Use {{variavel}} para placeholders."
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setE(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setE({ status: "active", model: "google/gemini-2.5-flash" })} className="btn-premium h-9 rounded-lg">
                <Plus className="h-3.5 w-3.5" /> Novo prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-mint-soft bg-[hsl(var(--sidebar-bg))]">
              <DialogHeader><DialogTitle>{e?.id ? "Editar" : "Novo"} prompt</DialogTitle></DialogHeader>
              <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2">
                <Field label="Nome"><Input value={e?.name ?? ""} onChange={(ev) => setE({ ...e, name: ev.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Categoria"><Input value={e?.category ?? ""} onChange={(ev) => setE({ ...e, category: ev.target.value })} placeholder="Ex: Diagnóstico" /></Field>
                  <Field label="Modelo">
                    <Select value={e?.model ?? "google/gemini-2.5-flash"} onValueChange={(v) => setE({ ...e, model: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Descrição"><Textarea rows={2} value={e?.description ?? ""} onChange={(ev) => setE({ ...e, description: ev.target.value })} /></Field>
                <Field label="Prompt" hint="Use {{variavel}} para inserir dados dinâmicos."><Textarea rows={8} className="font-mono text-[12px]" value={e?.content ?? ""} onChange={(ev) => setE({ ...e, content: ev.target.value })} /></Field>
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

      {items.length === 0 ? <EmptyState icon={Bot} title="Nenhum prompt" description="Crie prompts reutilizáveis para os modelos de IA." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((p) => (
            <GlassCard key={p.id} className="glass-hover">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 shrink-0"><Bot className="h-3.5 w-3.5 text-primary" /></div>
                  <div className="min-w-0">
                    <h3 className="font-display text-[15px] font-medium tracking-tight truncate">{p.name}</h3>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-dim mt-0.5">{p.category ?? "—"} · {p.model}</div>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              {p.description && <p className="text-[12px] text-dim-2 mb-3">{p.description}</p>}
              <pre className="rounded-lg border border-mint-soft bg-white/[0.02] p-2.5 font-mono text-[10px] text-dim-2 max-h-24 overflow-hidden line-clamp-4 whitespace-pre-wrap">{p.content}</pre>
              <div className="mt-3 flex justify-end gap-0.5 border-t border-white/[0.04] pt-3">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copy(p.content)}><Copy className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setE(p); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del(p.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
