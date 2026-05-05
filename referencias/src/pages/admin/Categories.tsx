import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, GlassCard, EmptyState, Field } from "@/components/admin/ui";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export default function Categories() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [e, setE] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("display_order").order("name");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!e?.name) return toast.error("Nome obrigatório");
    const payload = {
      name: e.name, slug: e.slug || slugify(e.name),
      description: e.description ?? null, color: e.color || "#6DF9C6",
      type: e.type ?? "post", display_order: e.display_order ?? 0,
    };
    const r = e.id ? await supabase.from("categories").update(payload).eq("id", e.id) : await supabase.from("categories").insert(payload);
    if (r.error) return toast.error(r.error.message);
    toast.success("Salvo"); setOpen(false); setE(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Excluir categoria?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="Conteúdo" title="Categorias"
        description="Organize posts e cases por categorias com cor e ordem de exibição."
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setE(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setE({ type: "post", color: "#6DF9C6" })} className="btn-premium h-9 rounded-lg">
                <Plus className="h-3.5 w-3.5" /> Nova categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="border-mint-soft bg-[hsl(var(--sidebar-bg))]">
              <DialogHeader><DialogTitle>{e?.id ? "Editar" : "Nova"} categoria</DialogTitle></DialogHeader>
              <div className="grid gap-4">
                <Field label="Nome"><Input value={e?.name ?? ""} onChange={(ev) => setE({ ...e, name: ev.target.value, slug: e?.id ? e.slug : slugify(ev.target.value) })} /></Field>
                <Field label="Slug"><Input value={e?.slug ?? ""} onChange={(ev) => setE({ ...e, slug: ev.target.value })} /></Field>
                <Field label="Descrição"><Textarea rows={2} value={e?.description ?? ""} onChange={(ev) => setE({ ...e, description: ev.target.value })} /></Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Tipo">
                    <Select value={e?.type ?? "post"} onValueChange={(v) => setE({ ...e, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="post">Post</SelectItem><SelectItem value="case">Case</SelectItem></SelectContent>
                    </Select>
                  </Field>
                  <Field label="Cor"><Input type="color" value={e?.color ?? "#6DF9C6"} onChange={(ev) => setE({ ...e, color: ev.target.value })} className="h-10 p-1" /></Field>
                  <Field label="Ordem"><Input type="number" value={e?.display_order ?? 0} onChange={(ev) => setE({ ...e, display_order: +ev.target.value })} /></Field>
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

      {items.length === 0 ? <EmptyState icon={FolderTree} title="Nenhuma categoria" description="Crie categorias para organizar posts e cases." /> : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <GlassCard key={c.id} className="glass-hover p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg shrink-0" style={{ background: `linear-gradient(135deg, ${c.color}40, ${c.color}10)`, boxShadow: `inset 0 0 0 1px ${c.color}30` }}>
                    <div className="h-full w-full rounded-lg flex items-center justify-center" style={{ color: c.color }}><FolderTree className="h-4 w-4" /></div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[14px] truncate">{c.name}</div>
                    <div className="font-mono text-[10px] text-dim">/{c.slug} · {c.type}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setE(c); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del(c.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
              {c.description && <p className="mt-3 text-[12px] text-dim-2 line-clamp-2">{c.description}</p>}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
