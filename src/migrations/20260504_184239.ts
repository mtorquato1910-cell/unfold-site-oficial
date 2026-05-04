import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'editor');
  CREATE TYPE "public"."enum_cases_pillars_pilar" AS ENUM('diagnosticar', 'estruturar', 'operar');
  CREATE TYPE "public"."enum_cases_vertical" AS ENUM('construcao', 'agro', 'b2b-saas', 'industria', 'varejo', 'servicos');
  CREATE TYPE "public"."enum_cases_status" AS ENUM('rascunho', 'publicado');
  CREATE TYPE "public"."enum_quiz_questions_pilar" AS ENUM('diagnosticar', 'estruturar', 'operar', 'evoluir');
  CREATE TYPE "public"."enum_insights_variations_nivel_fit" AS ENUM('alto', 'medio', 'baixo');
  CREATE TYPE "public"."enum_insights_variations_pilar" AS ENUM('geral', 'diagnosticar', 'estruturar', 'operar', 'evoluir');
  CREATE TYPE "public"."enum_diagnostico_results_nivel_fit" AS ENUM('alto', 'medio', 'baixo');
  CREATE TYPE "public"."enum_leads_tamanho_equipe" AS ENUM('1-5', '6-20', '21-50', '51-200', '200+');
  CREATE TYPE "public"."enum_leads_receita_anual" AS ENUM('ate-1mm', '1mm-5mm', '5mm-20mm', '20mm-100mm', '100mm+');
  CREATE TYPE "public"."enum_leads_origem" AS ENUM('diagnostico', 'calculadora', 'contato', 'outro');
  CREATE TYPE "public"."enum_leads_rd_sync_status" AS ENUM('pending', 'synced', 'error', 'mock');
  CREATE TYPE "public"."enum_posts_pilar" AS ENUM('diagnosticar', 'estruturar', 'operar', 'evoluir', 'geral');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_categories_pilar" AS ENUM('diagnosticar', 'estruturar', 'operar', 'evoluir', 'geral');
  CREATE TYPE "public"."enum_ai_prompts_tipo" AS ENUM('calculadora', 'diagnostico', 'geral');
  CREATE TYPE "public"."enum_audit_log_acao" AS ENUM('lead.created', 'diagnostico.completed', 'calculadora.submitted', 'lgpd.consent', 'lgpd.request', 'lgpd.revoke', 'admin.login', 'email.sent', 'crm.sync', 'rd.webhook.converted', 'rd.webhook.opportunity_created');
  CREATE TYPE "public"."enum_audit_log_status" AS ENUM('ok', 'error');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "cases_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "cases_pillars_acoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"acao" varchar NOT NULL
  );
  
  CREATE TABLE "cases_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pilar" "enum_cases_pillars_pilar" NOT NULL,
  	"descricao" varchar
  );
  
  CREATE TABLE "cases_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"metrica" varchar NOT NULL,
  	"valor" varchar NOT NULL,
  	"contexto" varchar
  );
  
  CREATE TABLE "cases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"client" varchar NOT NULL,
  	"vertical" "enum_cases_vertical" NOT NULL,
  	"imagem_destaque_id" integer,
  	"tagline" varchar,
  	"challenge" varchar,
  	"solution" varchar,
  	"destacar_na_home" boolean DEFAULT false,
  	"status" "enum_cases_status" DEFAULT 'rascunho' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quiz_questions_opcoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"valor" numeric NOT NULL
  );
  
  CREATE TABLE "quiz_questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pergunta" varchar NOT NULL,
  	"pilar" "enum_quiz_questions_pilar" NOT NULL,
  	"peso" numeric DEFAULT 1 NOT NULL,
  	"ordem" numeric NOT NULL,
  	"ativo" boolean DEFAULT true,
  	"nota_interna" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "insights_variations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"nivel_fit" "enum_insights_variations_nivel_fit" NOT NULL,
  	"pilar" "enum_insights_variations_pilar" DEFAULT 'geral',
  	"headline" varchar NOT NULL,
  	"corpo" varchar NOT NULL,
  	"cta_texto" varchar DEFAULT 'Agendar conversa estratégica',
  	"ativo" boolean DEFAULT true,
  	"nota_interna" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "diagnostico_results" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead_email" varchar NOT NULL,
  	"lead_id_id" integer,
  	"score_total" numeric NOT NULL,
  	"score_diagnosticar" numeric,
  	"score_estruturar" numeric,
  	"score_operar" numeric,
  	"score_evoluir" numeric,
  	"nivel_fit" "enum_diagnostico_results_nivel_fit",
  	"respostas_raw" varchar,
  	"insight_id_id" integer,
  	"token_jwt" varchar,
  	"email_enviado" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"empresa" varchar NOT NULL,
  	"cargo" varchar,
  	"tamanho_equipe" "enum_leads_tamanho_equipe",
  	"receita_anual" "enum_leads_receita_anual",
  	"origem" "enum_leads_origem" DEFAULT 'diagnostico' NOT NULL,
  	"diagnostico_result_id_id" integer,
  	"rd_sync_status" "enum_leads_rd_sync_status" DEFAULT 'pending',
  	"rd_contact_id" varchar,
  	"consentimento_lgpd" boolean DEFAULT false,
  	"ip_address" varchar,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"resumo" varchar NOT NULL,
  	"categoria_id" integer,
  	"pilar" "enum_posts_pilar" DEFAULT 'geral',
  	"imagem_destaque_id" integer,
  	"conteudo" jsonb NOT NULL,
  	"status" "enum_posts_status" DEFAULT 'draft' NOT NULL,
  	"publicado_em" timestamp(3) with time zone,
  	"autor" varchar DEFAULT 'Equipe Unfold Growth',
  	"tempo_leitura" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"pilar" "enum_categories_pilar" DEFAULT 'geral',
  	"descricao" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ai_prompts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"tipo" "enum_ai_prompts_tipo" NOT NULL,
  	"system_prompt" varchar NOT NULL,
  	"user_prompt_template" varchar NOT NULL,
  	"modelo" varchar DEFAULT 'anthropic/claude-sonnet-4-5',
  	"temperatura" numeric DEFAULT 0.7,
  	"max_tokens" numeric DEFAULT 1500,
  	"versao" numeric DEFAULT 1,
  	"ativo" boolean DEFAULT true,
  	"notas" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"acao" "enum_audit_log_acao" NOT NULL,
  	"entidade" varchar,
  	"actor_email" varchar,
  	"ip" varchar,
  	"detalhes" varchar,
  	"status" "enum_audit_log_status" DEFAULT 'ok',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"cases_id" integer,
  	"quiz_questions_id" integer,
  	"insights_variations_id" integer,
  	"diagnostico_results_id" integer,
  	"leads_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"ai_prompts_id" integer,
  	"audit_log_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"logo_dark_id" integer,
  	"favicon_id" integer,
  	"og_image_padrao_id" integer,
  	"email_contato" varchar,
  	"email_notificacoes" varchar,
  	"email_dpo" varchar,
  	"whatsapp" varchar,
  	"linkedin" varchar,
  	"instagram" varchar,
  	"calendar_embed_url" varchar,
  	"calendar_label" varchar DEFAULT 'Agendar diagnóstico gratuito',
  	"site_name" varchar DEFAULT 'Unfold Growth',
  	"meta_descricao_padrao" varchar,
  	"keywords_padrao" varchar,
  	"rodape_texto" varchar,
  	"cnpj" varchar,
  	"endereco" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_highlights" ADD CONSTRAINT "cases_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_pillars_acoes" ADD CONSTRAINT "cases_pillars_acoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_pillars" ADD CONSTRAINT "cases_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases_results" ADD CONSTRAINT "cases_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases" ADD CONSTRAINT "cases_imagem_destaque_id_media_id_fk" FOREIGN KEY ("imagem_destaque_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quiz_questions_opcoes" ADD CONSTRAINT "quiz_questions_opcoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "diagnostico_results" ADD CONSTRAINT "diagnostico_results_lead_id_id_leads_id_fk" FOREIGN KEY ("lead_id_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "diagnostico_results" ADD CONSTRAINT "diagnostico_results_insight_id_id_insights_variations_id_fk" FOREIGN KEY ("insight_id_id") REFERENCES "public"."insights_variations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_diagnostico_result_id_id_diagnostico_results_id_fk" FOREIGN KEY ("diagnostico_result_id_id") REFERENCES "public"."diagnostico_results"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_tags" ADD CONSTRAINT "posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_categoria_id_categories_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_imagem_destaque_id_media_id_fk" FOREIGN KEY ("imagem_destaque_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cases_fk" FOREIGN KEY ("cases_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quiz_questions_fk" FOREIGN KEY ("quiz_questions_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insights_variations_fk" FOREIGN KEY ("insights_variations_id") REFERENCES "public"."insights_variations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_diagnostico_results_fk" FOREIGN KEY ("diagnostico_results_id") REFERENCES "public"."diagnostico_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_prompts_fk" FOREIGN KEY ("ai_prompts_id") REFERENCES "public"."ai_prompts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_padrao_id_media_id_fk" FOREIGN KEY ("og_image_padrao_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "cases_highlights_order_idx" ON "cases_highlights" USING btree ("_order");
  CREATE INDEX "cases_highlights_parent_id_idx" ON "cases_highlights" USING btree ("_parent_id");
  CREATE INDEX "cases_pillars_acoes_order_idx" ON "cases_pillars_acoes" USING btree ("_order");
  CREATE INDEX "cases_pillars_acoes_parent_id_idx" ON "cases_pillars_acoes" USING btree ("_parent_id");
  CREATE INDEX "cases_pillars_order_idx" ON "cases_pillars" USING btree ("_order");
  CREATE INDEX "cases_pillars_parent_id_idx" ON "cases_pillars" USING btree ("_parent_id");
  CREATE INDEX "cases_results_order_idx" ON "cases_results" USING btree ("_order");
  CREATE INDEX "cases_results_parent_id_idx" ON "cases_results" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cases_slug_idx" ON "cases" USING btree ("slug");
  CREATE INDEX "cases_imagem_destaque_idx" ON "cases" USING btree ("imagem_destaque_id");
  CREATE INDEX "cases_updated_at_idx" ON "cases" USING btree ("updated_at");
  CREATE INDEX "cases_created_at_idx" ON "cases" USING btree ("created_at");
  CREATE INDEX "quiz_questions_opcoes_order_idx" ON "quiz_questions_opcoes" USING btree ("_order");
  CREATE INDEX "quiz_questions_opcoes_parent_id_idx" ON "quiz_questions_opcoes" USING btree ("_parent_id");
  CREATE INDEX "quiz_questions_updated_at_idx" ON "quiz_questions" USING btree ("updated_at");
  CREATE INDEX "quiz_questions_created_at_idx" ON "quiz_questions" USING btree ("created_at");
  CREATE INDEX "insights_variations_updated_at_idx" ON "insights_variations" USING btree ("updated_at");
  CREATE INDEX "insights_variations_created_at_idx" ON "insights_variations" USING btree ("created_at");
  CREATE INDEX "diagnostico_results_lead_id_idx" ON "diagnostico_results" USING btree ("lead_id_id");
  CREATE INDEX "diagnostico_results_insight_id_idx" ON "diagnostico_results" USING btree ("insight_id_id");
  CREATE INDEX "diagnostico_results_updated_at_idx" ON "diagnostico_results" USING btree ("updated_at");
  CREATE INDEX "diagnostico_results_created_at_idx" ON "diagnostico_results" USING btree ("created_at");
  CREATE INDEX "leads_diagnostico_result_id_idx" ON "leads" USING btree ("diagnostico_result_id_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "posts_tags_order_idx" ON "posts_tags" USING btree ("_order");
  CREATE INDEX "posts_tags_parent_id_idx" ON "posts_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_categoria_idx" ON "posts" USING btree ("categoria_id");
  CREATE INDEX "posts_imagem_destaque_idx" ON "posts" USING btree ("imagem_destaque_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "ai_prompts_updated_at_idx" ON "ai_prompts" USING btree ("updated_at");
  CREATE INDEX "ai_prompts_created_at_idx" ON "ai_prompts" USING btree ("created_at");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_cases_id_idx" ON "payload_locked_documents_rels" USING btree ("cases_id");
  CREATE INDEX "payload_locked_documents_rels_quiz_questions_id_idx" ON "payload_locked_documents_rels" USING btree ("quiz_questions_id");
  CREATE INDEX "payload_locked_documents_rels_insights_variations_id_idx" ON "payload_locked_documents_rels" USING btree ("insights_variations_id");
  CREATE INDEX "payload_locked_documents_rels_diagnostico_results_id_idx" ON "payload_locked_documents_rels" USING btree ("diagnostico_results_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_ai_prompts_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_prompts_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_dark_idx" ON "site_settings" USING btree ("logo_dark_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_og_image_padrao_idx" ON "site_settings" USING btree ("og_image_padrao_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "cases_highlights" CASCADE;
  DROP TABLE "cases_pillars_acoes" CASCADE;
  DROP TABLE "cases_pillars" CASCADE;
  DROP TABLE "cases_results" CASCADE;
  DROP TABLE "cases" CASCADE;
  DROP TABLE "quiz_questions_opcoes" CASCADE;
  DROP TABLE "quiz_questions" CASCADE;
  DROP TABLE "insights_variations" CASCADE;
  DROP TABLE "diagnostico_results" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "posts_tags" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "ai_prompts" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_cases_pillars_pilar";
  DROP TYPE "public"."enum_cases_vertical";
  DROP TYPE "public"."enum_cases_status";
  DROP TYPE "public"."enum_quiz_questions_pilar";
  DROP TYPE "public"."enum_insights_variations_nivel_fit";
  DROP TYPE "public"."enum_insights_variations_pilar";
  DROP TYPE "public"."enum_diagnostico_results_nivel_fit";
  DROP TYPE "public"."enum_leads_tamanho_equipe";
  DROP TYPE "public"."enum_leads_receita_anual";
  DROP TYPE "public"."enum_leads_origem";
  DROP TYPE "public"."enum_leads_rd_sync_status";
  DROP TYPE "public"."enum_posts_pilar";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum_categories_pilar";
  DROP TYPE "public"."enum_ai_prompts_tipo";
  DROP TYPE "public"."enum_audit_log_acao";
  DROP TYPE "public"."enum_audit_log_status";`)
}
