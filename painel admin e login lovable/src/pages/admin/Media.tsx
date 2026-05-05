import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PageHeader, GlassCard, EmptyState, Field } from "@/components/admin/ui";
import { Plus, Trash2, Image as ImageIcon, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Media() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [e, setE] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!e?.url || !e?.name) return toast.error("Nome e URL obrigatórios");
    const payload = {
      name: e.name, url: e.url, type: e.type || "image",
      mime_type: e.mime_type ?? null, alt: e.alt ?? null,
      tags: typeof e.tags === "string" ? e.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : (e.tags ?? []),
    };
    const r = await supabase.from("media").insert(payload);
    if (r.error) return toast.error(r.error.message);
    toast.success("Adicionado"); setOpen(false); setE(null); load();
  };
  const del = async (id: string) => {
    if (!confirm("Excluir mídia?")) return;
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };
  const copy = (url: string) => { navigator.clipboard.writeText(url); toast.success("URL copiada"); };

  return (
    <div className="max-w-7xl">
      <PageHeader
        eyebrow="Conteúdo" title="Biblioteca de Mídia"
        description="Centralize URLs de imagens e vídeos para reutilizar em posts, cases e depoimentos."
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setE(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setE({ type: "image" })} className="btn-premium h-9 rounded-lg">
                <Plus className="h-3.5 w-3.5" /> Adicionar mídia
              </Button>
            </DialogTrigger>
            <DialogContent className="border-mint-soft bg-[hsl(var(--sidebar-bg))]">
              <DialogHeader><DialogTitle>Nova mídia</DialogTitle></DialogHeader>
              <div className="grid gap-4">
                <Field label="Nome"><Input value={e?.name ?? ""} onChange={(ev) => setE({ ...e, name: ev.target.value })} /></Field>
                <Field label="URL"><Input value={e?.url ?? ""} onChange={(ev) => setE({ ...e, url: ev.target.value })} placeholder="https://..." /></Field>
                <Field label="Texto alternativo"><Input value={e?.alt ?? ""} onChange={(ev) => setE({ ...e, alt: ev.target.value })} /></Field>
                <Field label="Tags (vírgula)"><Input value={e?.tags ?? ""} onChange={(ev) => setE({ ...e, tags: ev.target.value })} /></Field>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save} className="btn-premium">Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {items.length === 0 ? <EmptyState icon={ImageIcon} title="Biblioteca vazia" description="Adicione URLs de imagens para reutilizar no painel." /> : (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((m) => (
            <div key={m.id} className="glass glass-hover rounded-xl overflow-hidden group">
              <div className="aspect-square bg-white/[0.02] relative">
                <img src={m.url} alt={m.alt ?? m.name} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-end p-2 gap-1">
                  <button onClick={() => copy(m.url)} className="rounded-md bg-white/10 backdrop-blur p-1.5 hover:bg-white/20 transition" title="Copiar URL"><Copy className="h-3 w-3" /></button>
                  <a href={m.url} target="_blank" rel="noreferrer" className="rounded-md bg-white/10 backdrop-blur p-1.5 hover:bg-white/20 transition"><ExternalLink className="h-3 w-3" /></a>
                  <button onClick={() => del(m.id)} className="rounded-md bg-destructive/80 backdrop-blur p-1.5 hover:bg-destructive transition"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="p-2.5">
                <div className="text-[12px] font-medium truncate">{m.name}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-dim mt-0.5">{m.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
