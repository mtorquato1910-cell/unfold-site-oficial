import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_testimonials_vertical" AS ENUM('construcao', 'agro', 'tech', 'automotivo', 'industrias', 'servicos', 'outro');
  ALTER TYPE "public"."enum_posts_status" ADD VALUE 'pending_review' BEFORE 'published';
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"cargo" varchar,
  	"empresa" varchar NOT NULL,
  	"depoimento" varchar NOT NULL,
  	"foto_id" integer,
  	"avaliacao" numeric DEFAULT 5,
  	"vertical" "enum_testimonials_vertical",
  	"destaque" boolean DEFAULT false,
  	"ativo" boolean DEFAULT true,
  	"ordem" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "youtube" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "politica_privacidade" jsonb;
  ALTER TABLE "site_settings" ADD COLUMN "termos_de_uso" jsonb;
  ALTER TABLE "site_settings" ADD COLUMN "lgpd_aviso_cookies" varchar DEFAULT 'Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa Política de Privacidade.';
  ALTER TABLE "site_settings" ADD COLUMN "insights_titulo" varchar DEFAULT 'Insights de crescimento';
  ALTER TABLE "site_settings" ADD COLUMN "insights_subtitulo" varchar DEFAULT 'Diagnóstico, estrutura e operação — os três pilares do método UGS em forma de conhecimento aplicado.';
  ALTER TABLE "site_settings" ADD COLUMN "insights_cta_texto" varchar DEFAULT 'Ver todos os artigos';
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "testimonials_foto_idx" ON "testimonials" USING btree ("foto_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_posts_id_idx" ON "site_settings_rels" USING btree ("posts_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  
  ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_posts_status";
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_posts_status";
  ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE "public"."enum_posts_status" USING "status"::"public"."enum_posts_status";
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "site_settings" DROP COLUMN "youtube";
  ALTER TABLE "site_settings" DROP COLUMN "politica_privacidade";
  ALTER TABLE "site_settings" DROP COLUMN "termos_de_uso";
  ALTER TABLE "site_settings" DROP COLUMN "lgpd_aviso_cookies";
  ALTER TABLE "site_settings" DROP COLUMN "insights_titulo";
  ALTER TABLE "site_settings" DROP COLUMN "insights_subtitulo";
  ALTER TABLE "site_settings" DROP COLUMN "insights_cta_texto";
  DROP TYPE "public"."enum_testimonials_vertical";`)
}
