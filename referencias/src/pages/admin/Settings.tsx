import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader, GlassCard } from "@/components/admin/ui";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const [s, setS] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*").maybeSingle();
      setS(data ?? {});
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setBusy(true);
    const res = s.id
      ? await supabase.from("site_settings").update(s).eq("id", s.id)
      : await supabase.from("site_settings").insert(s).select().single();
    setBusy(false);
    if (res.error) toast.error(res.error.message);
    else {
      if ((res as any).data) setS((res as any).data);
      toast.success("Configurações salvas");
    }
  };

  if (loading) return null;

  return (
    <div>
      <PageHeader
        title="Configurações" description="Identidade e contato do site"
        actions={<Button onClick={save} disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary/90">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 font-medium">Identidade</h3>
          <div className="space-y-3">
            <F label="Nome do site"><Input value={s.site_name ?? ""} onChange={(e) => setS({ ...s, site_name: e.target.value })} /></F>
            <F label="Tagline"><Input value={s.tagline ?? ""} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></F>
            <F label="Descrição"><Textarea rows={3} value={s.site_description ?? ""} onChange={(e) => setS({ ...s, site_description: e.target.value })} /></F>
            <F label="Missão"><Textarea rows={3} value={s.mission ?? ""} onChange={(e) => setS({ ...s, mission: e.target.value })} /></F>
            <F label="Logo (URL)"><Input value={s.logo_url ?? ""} onChange={(e) => setS({ ...s, logo_url: e.target.value })} /></F>
            <F label="Favicon (URL)"><Input value={s.favicon_url ?? ""} onChange={(e) => setS({ ...s, favicon_url: e.target.value })} /></F>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 font-medium">Contato e Social</h3>
          <div className="space-y-3">
            <F label="E-mail"><Input value={s.contact_email ?? ""} onChange={(e) => setS({ ...s, contact_email: e.target.value })} /></F>
            <F label="Telefone"><Input value={s.contact_phone ?? ""} onChange={(e) => setS({ ...s, contact_phone: e.target.value })} /></F>
            <F label="WhatsApp"><Input value={s.whatsapp ?? ""} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} /></F>
            <F label="LinkedIn"><Input value={s.linkedin_url ?? ""} onChange={(e) => setS({ ...s, linkedin_url: e.target.value })} /></F>
            <F label="Instagram"><Input value={s.instagram_url ?? ""} onChange={(e) => setS({ ...s, instagram_url: e.target.value })} /></F>
            <F label="YouTube"><Input value={s.youtube_url ?? ""} onChange={(e) => setS({ ...s, youtube_url: e.target.value })} /></F>
            <F label="Calendário (URL)"><Input value={s.calendar_url ?? ""} onChange={(e) => setS({ ...s, calendar_url: e.target.value })} /></F>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="mb-4 font-medium">SEO padrão</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <F label="Meta título"><Input value={s.default_meta_title ?? ""} onChange={(e) => setS({ ...s, default_meta_title: e.target.value })} /></F>
            <F label="Meta descrição"><Textarea rows={3} value={s.default_meta_description ?? ""} onChange={(e) => setS({ ...s, default_meta_description: e.target.value })} /></F>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-dim-2">{label}</Label>{children}</div>;
}
