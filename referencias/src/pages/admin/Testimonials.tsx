import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, GlassCard, StatusBadge, EmptyState } from "@/components/admin/ui";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export default function Testimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("display_order").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name || !editing?.testimonial) { toast.error("Nome e depoimento são obrigatórios"); return; }
    const payload = {
      name: editing.name, role: editing.role ?? null, company: editing.company ?? null,
      testimonial: editing.testimonial, photo: editing.photo ?? null,
      rating: editing.rating ?? 5, display_order: editing.display_order ?? 0,
      status: editing.status ?? "published",
    };
    const res = editing.id
      ? await supabase.from("testimonials").update(payload).eq("id", editing.id)
      : await supabase.from("testimonials").insert(payload);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Salvo"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };

  return (
    <div>
      <PageHeader
        title="Depoimentos" description="Testemunhos de clientes"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ rating: 5, status: "published", display_order: 0 })} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Novo depoimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl border-mint-soft bg-[hsl(var(--sidebar-bg))]">
              <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Novo"} depoimento</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <F label="Nome"><Input value={editing?.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></F>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Cargo"><Input value={editing?.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} /></F>
                  <F label="Empresa"><Input value={editing?.company ?? ""} onChange={(e) => setEditing({ ...editing, company: e.target.value })} /></F>
                </div>
                <F label="Depoimento"><Textarea rows={4} value={editing?.testimonial ?? ""} onChange={(e) => setEditing({ ...editing, testimonial: e.target.value })} /></F>
                <F label="Foto (URL)"><Input value={editing?.photo ?? ""} onChange={(e) => setEditing({ ...editing, photo: e.target.value })} /></F>
                <div className="grid grid-cols-3 gap-3">
                  <F label="Rating"><Input type="number" min={1} max={5} value={editing?.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: +e.target.value })} /></F>
                  <F label="Ordem"><Input type="number" value={editing?.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: +e.target.value })} /></F>
                  <F label="Status">
                    <Select value={editing?.status ?? "published"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="published">Publicado</SelectItem><SelectItem value="draft">Rascunho</SelectItem></SelectContent>
                    </Select>
                  </F>
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
        <EmptyState title="Nenhum depoimento ainda" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t) => (
            <GlassCard key={t.id} className="glass-hover">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium ring-1 ring-primary/20">
                  {t.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="text-xs text-dim-2 truncate">{[t.role, t.company].filter(Boolean).join(" · ")}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-sm text-dim-2 italic">"{t.testimonial}"</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "fill-primary text-primary" : "text-dim"}`} />
                  ))}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-dim-2">{label}</Label>{children}</div>;
}
