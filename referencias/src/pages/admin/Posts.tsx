import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, GlassCard, StatusBadge, EmptyState } from "@/components/admin/ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Post = {
  id: string; title: string; slug: string; content: string | null; excerpt: string | null;
  category: string | null; status: string; tags: string[] | null;
  meta_title: string | null; meta_description: string | null; cover_image: string | null;
  published_at: string | null; created_at: string;
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export default function Posts() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Post[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload: any = {
      title: editing.title, slug: editing.slug || slugify(editing.title ?? ""),
      content: editing.content ?? null, excerpt: editing.excerpt ?? null,
      category: editing.category ?? null, status: editing.status ?? "draft",
      meta_title: editing.meta_title ?? null, meta_description: editing.meta_description ?? null,
      cover_image: editing.cover_image ?? null,
      tags: typeof editing.tags === "string" ? (editing.tags as any).split(",").map((t: string) => t.trim()).filter(Boolean) : (editing.tags ?? []),
      published_at: editing.status === "published" ? (editing.published_at ?? new Date().toISOString()) : null,
    };
    if (!payload.title) { toast.error("Título obrigatório"); return; }
    const res = editing.id
      ? await supabase.from("posts").update(payload).eq("id", editing.id)
      : await supabase.from("posts").insert(payload);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Salvo"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };

  return (
    <div>
      <PageHeader
        title="Posts / Blog" description="Crie, edite e publique artigos"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing({ status: "draft" })} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Novo post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-mint-soft bg-[hsl(var(--sidebar-bg))]">
              <DialogHeader><DialogTitle>{editing?.id ? "Editar post" : "Novo post"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-2">
                <Field label="Título"><Input value={editing?.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing?.id ? editing.slug : slugify(e.target.value) })} /></Field>
                <Field label="Slug"><Input value={editing?.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
                <Field label="Resumo"><Textarea rows={2} value={editing?.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></Field>
                <Field label="Conteúdo (markdown)"><Textarea rows={8} value={editing?.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Categoria"><Input value={editing?.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></Field>
                  <Field label="Status">
                    <Select value={editing?.status ?? "draft"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="published">Publicado</SelectItem></SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Tags (vírgula)"><Input value={Array.isArray(editing?.tags) ? (editing!.tags as string[]).join(", ") : (editing?.tags as any) ?? ""} onChange={(e) => setEditing({ ...editing, tags: e.target.value as any })} /></Field>
                <Field label="Imagem de capa (URL)"><Input value={editing?.cover_image ?? ""} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} /></Field>
                <Field label="Meta título"><Input value={editing?.meta_title ?? ""} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} /></Field>
                <Field label="Meta descrição"><Textarea rows={2} value={editing?.meta_description ?? ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} /></Field>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save} className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? null : items.length === 0 ? (
        <EmptyState title="Nenhum post ainda" description="Clique em Novo post para começar" />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-mint-soft text-dim font-mono text-[10px] uppercase tracking-wider">
                <tr><th className="text-left p-4">Título</th><th className="text-left p-4">Categoria</th><th className="text-left p-4">Status</th><th className="text-left p-4">Criado</th><th className="p-4"></th></tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4"><div className="font-medium">{p.title}</div><div className="text-xs text-dim">/{p.slug}</div></td>
                    <td className="p-4 text-dim-2">{p.category ?? "—"}</td>
                    <td className="p-4"><StatusBadge status={p.status} /></td>
                    <td className="p-4 font-mono text-xs text-dim">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-dim-2">{label}</Label>
      {children}
    </div>
  );
}
