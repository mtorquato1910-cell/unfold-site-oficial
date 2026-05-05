import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader, GlassCard, StatusBadge, EmptyState } from "@/components/admin/ui";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

type Case = any;

export default function Cases() {
  const [items, setItems] = useState<Case[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Case> | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("cases").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title || !editing?.client_name) { toast.error("Título e cliente são obrigatórios"); return; }
    const payload = {
      title: editing.title, client_name: editing.client_name,
      client_logo: editing.client_logo ?? null, segment: editing.segment ?? null,
      challenge: editing.challenge ?? null, solution: editing.solution ?? null,
      result: editing.result ?? null, status: editing.status ?? "draft",
      featured: !!editing.featured, metrics: editing.metrics ?? [],
      images: editing.images ?? [],
    };
    const res = editing.id
      ? await supabase.from("cases").update(payload).eq("id", editing.id)
      : await supabase.from("cases").insert(payload);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Salvo"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este case?")) return;
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };

  return (
    <div>
      <PageHeader
        title="Cases" description="Histórias de sucesso de clientes"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ status: "draft", featured: false })} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Novo case
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-mint-soft bg-[hsl(var(--sidebar-bg))]">
              <DialogHeader><DialogTitle>{editing?.id ? "Editar case" : "Novo case"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2">
                <Field label="Título"><Input value={editing?.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cliente"><Input value={editing?.client_name ?? ""} onChange={(e) => setEditing({ ...editing, client_name: e.target.value })} /></Field>
                  <Field label="Segmento"><Input value={editing?.segment ?? ""} onChange={(e) => setEditing({ ...editing, segment: e.target.value })} /></Field>
                </div>
                <Field label="Logo do cliente (URL)"><Input value={editing?.client_logo ?? ""} onChange={(e) => setEditing({ ...editing, client_logo: e.target.value })} /></Field>
                <Field label="Desafio"><Textarea rows={3} value={editing?.challenge ?? ""} onChange={(e) => setEditing({ ...editing, challenge: e.target.value })} /></Field>
                <Field label="Solução"><Textarea rows={3} value={editing?.solution ?? ""} onChange={(e) => setEditing({ ...editing, solution: e.target.value })} /></Field>
                <Field label="Resultado"><Textarea rows={3} value={editing?.result ?? ""} onChange={(e) => setEditing({ ...editing, result: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Status">
                    <Select value={editing?.status ?? "draft"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="published">Publicado</SelectItem></SelectContent>
                    </Select>
                  </Field>
                  <Field label="Destaque">
                    <div className="flex h-10 items-center gap-2"><Switch checked={!!editing?.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} /><span className="text-sm text-dim-2">Marcar como featured</span></div>
                  </Field>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save} className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {items.length === 0 ? (
        <EmptyState title="Nenhum case ainda" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <GlassCard key={c.id} className="glass-hover transition-all">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-mono uppercase tracking-wider text-primary">{c.client_name}</div>
                  <h3 className="mt-1 font-medium truncate">{c.title}</h3>
                </div>
                {c.featured && <Star className="h-4 w-4 fill-primary text-primary" />}
              </div>
              <p className="text-xs text-dim-2 line-clamp-3 min-h-[3rem]">{c.result || c.challenge || "—"}</p>
              <div className="mt-4 flex items-center justify-between">
                <StatusBadge status={c.status} />
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-dim-2">{label}</Label>{children}</div>;
}
