import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "site"."enum_users_role" AS ENUM('super-admin', 'editor');
  CREATE TYPE "site"."enum_cases_pillars_pilar" AS ENUM('diagnosticar', 'estruturar', 'operar');
  CREATE TYPE "site"."enum_cases_vertical" AS ENUM('construcao', 'agro', 'b2b-saas', 'industria', 'varejo', 'servicos');
  CREATE TYPE "site"."enum_cases_status" AS ENUM('rascunho', 'publicado');
  CREATE TYPE "site"."enum_quiz_questions_pilar" AS ENUM('diagnosticar', 'estruturar', 'operar', 'evoluir');
  CREATE TYPE "site"."enum_insights_variations_nivel_fit" AS ENUM('alto', 'medio', 'baixo');
  CREATE TYPE "site"."enum_insights_variations_pilar" AS ENUM('geral', 'diagnosticar', 'estruturar', 'operar', 'evoluir');
  CREATE TYPE "site"."enum_diagnostico_results_nivel_fit" AS ENUM('alto', 'medio', 'baixo');
  CREATE TYPE "site"."enum_diagnostico_results_faixa_consolidada" AS ENUM('critica', 'em-formacao', 'estruturada', 'madura');
  CREATE TYPE "site"."enum_diagnostico_results_faixa_fit" AS ENUM('fit-alto', 'fit-medio', 'fit-baixo', 'desfit');
  CREATE TYPE "site"."enum_diagnostico_events_event_name" AS ENUM('diagnostico_iniciado', 'etapa_1_concluida', 'etapa_2_pergunta', 'diagnostico_concluido', 'pdf_baixado', 'resultado_compartilhado', 'opt_in_nutricao', 'agendamento_iniciado', 'agendamento_concluido', 'rd_webhook');
  CREATE TYPE "site"."enum_leads_tamanho_equipe" AS ENUM('1-5', '6-20', '21-50', '51-200', '200+');
  CREATE TYPE "site"."enum_leads_receita_anual" AS ENUM('ate-1mm', '1mm-5mm', '5mm-20mm', '20mm-100mm', '100mm+');
  CREATE TYPE "site"."enum_leads_setor" AS ENUM('construcao', 'agro', 'saas', 'automotivo', 'industria', 'servicos', 'outro');
  CREATE TYPE "site"."enum_leads_faturamento_faixa" AS ENUM('ate-50k', '50k-200k', '200k-500k', 'acima-500k', 'prefiro-nao-informar');
  CREATE TYPE "site"."enum_leads_urgencia" AS ENUM('trimestre', '6-meses', 'sem-prazo', 'pesquisando');
  CREATE TYPE "site"."enum_leads_origem" AS ENUM('diagnostico', 'calculadora', 'contato', 'outro');
  CREATE TYPE "site"."enum_leads_rd_sync_status" AS ENUM('pending', 'synced', 'error', 'mock');
  CREATE TYPE "site"."enum_posts_pilar" AS ENUM('diagnosticar', 'estruturar', 'operar', 'evoluir', 'geral');
  CREATE TYPE "site"."enum_posts_status" AS ENUM('draft', 'pending_review', 'published');
  CREATE TYPE "site"."enum_categories_pilar" AS ENUM('diagnosticar', 'estruturar', 'operar', 'evoluir', 'geral');
  CREATE TYPE "site"."enum_ai_prompts_tipo" AS ENUM('calculadora', 'diagnostico', 'geral');
  CREATE TYPE "site"."enum_audit_log_acao" AS ENUM('lead.created', 'diagnostico.completed', 'calculadora.submitted', 'lgpd.consent', 'lgpd.request', 'lgpd.revoke', 'admin.login', 'email.sent', 'crm.sync', 'rd.webhook.converted', 'rd.webhook.opportunity_created');
  CREATE TYPE "site"."enum_audit_log_status" AS ENUM('ok', 'error');
  CREATE TYPE "site"."enum_testimonials_vertical" AS ENUM('construcao', 'agro', 'tech', 'automotivo', 'industrias', 'servicos', 'outro');
  CREATE TYPE "site"."enum_newsletter_subscribers_status" AS ENUM('subscribed', 'unsubscribed', 'bounced');
  CREATE TYPE "site"."enum_newsletter_subscribers_rd_sync_status" AS ENUM('pending', 'synced', 'mock', 'error');
  CREATE TYPE "site"."enum_notifications_type" AS ENUM('post.in_review', 'post.approved', 'post.rejected', 'post.published', 'lead.new', 'lead.assigned', 'diagnostico.completed', 'system');
  CREATE TYPE "site"."enum_email_logs_status" AS ENUM('queued', 'sent', 'failed', 'bounced', 'complained');
  CREATE TYPE "site"."enum_email_logs_mode" AS ENUM('resend', 'mock-console');
  CREATE TYPE "site"."enum_faqs_category" AS ENUM('geral', 'diagnostico', 'metodo', 'cases', 'comercial');
  CREATE TYPE "site"."enum_calculadora_results_setor" AS ENUM('construcao', 'agro', 'saas', 'automotivo', 'industria', 'servicos_b2b', 'outro');
  CREATE TYPE "site"."enum_calculadora_results_calc_modelo_negocio" AS ENUM('b2b', 'b2c');
  CREATE TYPE "site"."enum_calculadora_results_calc_periodo_meses" AS ENUM('3', '6', '12');
  CREATE TYPE "site"."enum_calculadora_results_calc_insight_principal" AS ENUM('I-A', 'I-B', 'I-C', 'I-D');
  CREATE TYPE "site"."enum_calculadora_results_nutricao_step_atual" AS ENUM('pending', 'd1_sent', 'd3_sent', 'd7_sent', 'd14_sent', 'd21_sent', 'base_passiva', 'pausada_avancou', 'pausada_consent');
  CREATE TYPE "site"."enum_calculadora_results_email_status" AS ENUM('pending', 'sent', 'failed');
  CREATE TYPE "site"."enum_calculadora_results_rd_sync_status" AS ENUM('pending', 'synced', 'failed', 'skipped');
  CREATE TYPE "site"."enum_calculadora_events_event_name" AS ENUM('calculadora_iniciada', 'etapa_1_concluida', 'calculadora_input_alterado', 'premissa_alterada', 'resultado_visualizado', 'insight_exibido', 'pdf_baixado', 'resultado_compartilhado', 'calculadora_para_diagnostico', 'payload_tampered');
  CREATE TYPE "site"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "site"."enum_home_settings_solutions_icon" AS ENUM('Target', 'TrendingUp', 'Sparkles', 'BarChart3', 'Users', 'Rocket', 'Workflow', 'Zap', 'Calculator', 'ClipboardCheck', 'Award', 'Eye', 'Globe', 'Lightbulb', 'Star', 'Heart', 'ShieldCheck', 'Brain', 'Compass', 'LineChart', 'PieChart', 'MessageSquare', 'Phone', 'Mail', 'Search', 'Settings', 'Wrench', 'Database', 'Cpu', 'Activity', 'Layers', 'GitBranch');
  CREATE TYPE "site"."enum_home_settings_tools_icon" AS ENUM('Target', 'TrendingUp', 'Sparkles', 'BarChart3', 'Users', 'Rocket', 'Workflow', 'Zap', 'Calculator', 'ClipboardCheck', 'Award', 'Eye', 'Globe', 'Lightbulb', 'Star', 'Heart', 'ShieldCheck', 'Brain', 'Compass', 'LineChart', 'PieChart', 'MessageSquare', 'Phone', 'Mail', 'Search', 'Settings', 'Wrench', 'Database', 'Cpu', 'Activity', 'Layers', 'GitBranch');
  CREATE TABLE "site"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "site"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "site"."enum_users_role" DEFAULT 'editor' NOT NULL,
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
  
  CREATE TABLE "site"."media" (
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
  
  CREATE TABLE "site"."cases_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site"."cases_pillars_acoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"acao" varchar NOT NULL
  );
  
  CREATE TABLE "site"."cases_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pilar" "site"."enum_cases_pillars_pilar" NOT NULL,
  	"descricao" varchar
  );
  
  CREATE TABLE "site"."cases_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"metrica" varchar NOT NULL,
  	"valor" varchar NOT NULL,
  	"contexto" varchar
  );
  
  CREATE TABLE "site"."cases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"client" varchar NOT NULL,
  	"vertical" "site"."enum_cases_vertical" NOT NULL,
  	"imagem_destaque_id" integer,
  	"tagline" varchar,
  	"challenge" varchar,
  	"solution" varchar,
  	"destacar_na_home" boolean DEFAULT false,
  	"status" "site"."enum_cases_status" DEFAULT 'rascunho' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."quiz_questions_opcoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"valor" numeric NOT NULL
  );
  
  CREATE TABLE "site"."quiz_questions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pergunta" varchar NOT NULL,
  	"pilar" "site"."enum_quiz_questions_pilar" NOT NULL,
  	"peso" numeric DEFAULT 1 NOT NULL,
  	"ordem" numeric NOT NULL,
  	"ativo" boolean DEFAULT true,
  	"nota_interna" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."insights_variations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"nivel_fit" "site"."enum_insights_variations_nivel_fit" NOT NULL,
  	"pilar" "site"."enum_insights_variations_pilar" DEFAULT 'geral',
  	"headline" varchar NOT NULL,
  	"corpo" varchar NOT NULL,
  	"cta_texto" varchar DEFAULT 'Agendar conversa estratégica',
  	"ativo" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"publish_order" numeric DEFAULT 0,
  	"nota_interna" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."diagnostico_results" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead_email" varchar NOT NULL,
  	"lead_id_id" integer,
  	"score_total" numeric NOT NULL,
  	"score_diagnosticar" numeric,
  	"score_estruturar" numeric,
  	"score_operar" numeric,
  	"score_evoluir" numeric,
  	"nivel_fit" "site"."enum_diagnostico_results_nivel_fit",
  	"respostas_raw" varchar,
  	"insight_id_id" integer,
  	"token_jwt" varchar,
  	"email_enviado" boolean DEFAULT false,
  	"score_gestao" numeric,
  	"faixa_consolidada" "site"."enum_diagnostico_results_faixa_consolidada",
  	"fit_estrutural" numeric,
  	"fit_dor" numeric,
  	"fit_cabeca" numeric,
  	"fit_urgencia" numeric,
  	"score_fit" numeric,
  	"faixa_fit" "site"."enum_diagnostico_results_faixa_fit",
  	"padroes_acionados" jsonb,
  	"padroes_exibidos" jsonb,
  	"caminhos_exibidos" jsonb,
  	"url_resultado_hash" varchar,
  	"data_inicio" timestamp(3) with time zone,
  	"data_conclusao" timestamp(3) with time zone,
  	"tempo_total_segundos" numeric,
  	"agendou" boolean DEFAULT false,
  	"slot_agendado" timestamp(3) with time zone,
  	"respostas_etapa1_raw" jsonb,
  	"notificado_at" timestamp(3) with time zone,
  	"nutricao_enviada_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."diagnostico_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_name" "site"."enum_diagnostico_events_event_name" NOT NULL,
  	"session_id" varchar,
  	"result_hash" varchar,
  	"lead_email" varchar,
  	"metadata" jsonb,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"empresa" varchar NOT NULL,
  	"cargo" varchar,
  	"tamanho_equipe" "site"."enum_leads_tamanho_equipe",
  	"receita_anual" "site"."enum_leads_receita_anual",
  	"setor" "site"."enum_leads_setor",
  	"faturamento_faixa" "site"."enum_leads_faturamento_faixa",
  	"urgencia" "site"."enum_leads_urgencia",
  	"origem" "site"."enum_leads_origem" DEFAULT 'diagnostico' NOT NULL,
  	"diagnostico_result_id_id" integer,
  	"rd_sync_status" "site"."enum_leads_rd_sync_status" DEFAULT 'pending',
  	"rd_contact_id" varchar,
  	"reengajamento_enviado_at" timestamp(3) with time zone,
  	"rd_sync_attempts" numeric DEFAULT 0,
  	"telefone" varchar,
  	"consentimento_lgpd" boolean DEFAULT false,
  	"ip_address" varchar,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."posts_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "site"."posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"resumo" varchar NOT NULL,
  	"categoria_id" integer,
  	"pilar" "site"."enum_posts_pilar" DEFAULT 'geral',
  	"imagem_destaque_id" integer,
  	"conteudo" jsonb NOT NULL,
  	"status" "site"."enum_posts_status" DEFAULT 'draft' NOT NULL,
  	"publicado_em" timestamp(3) with time zone,
  	"autor" varchar DEFAULT 'Equipe Unfold Growth',
  	"tempo_leitura" numeric,
  	"destaque_home" boolean DEFAULT false,
  	"ordem_home" numeric DEFAULT 0,
  	"is_external_submission" boolean DEFAULT false,
  	"submitted_by_name" varchar,
  	"submitted_by_email" varchar,
  	"submitted_by_company" varchar,
  	"rejection_reason" varchar,
  	"reviewed_by" varchar,
  	"reviewed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"pilar" "site"."enum_categories_pilar" DEFAULT 'geral',
  	"descricao" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."ai_prompts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"tipo" "site"."enum_ai_prompts_tipo" NOT NULL,
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
  
  CREATE TABLE "site"."audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"acao" "site"."enum_audit_log_acao" NOT NULL,
  	"entidade" varchar,
  	"actor_email" varchar,
  	"ip" varchar,
  	"detalhes" varchar,
  	"status" "site"."enum_audit_log_status" DEFAULT 'ok',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"cargo" varchar,
  	"empresa" varchar NOT NULL,
  	"depoimento" varchar NOT NULL,
  	"foto_id" integer,
  	"logo_empresa_id" integer,
  	"avaliacao" numeric DEFAULT 5,
  	"vertical" "site"."enum_testimonials_vertical",
  	"destaque" boolean DEFAULT false,
  	"ativo" boolean DEFAULT true,
  	"ordem" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"logo_id" integer,
  	"website" varchar,
  	"ativo" boolean DEFAULT true,
  	"ordem" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."newsletter_subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"status" "site"."enum_newsletter_subscribers_status" DEFAULT 'subscribed' NOT NULL,
  	"source" varchar DEFAULT 'site-footer',
  	"rd_sync_status" "site"."enum_newsletter_subscribers_rd_sync_status" DEFAULT 'pending',
  	"rd_contact_id" varchar,
  	"rd_synced_at" timestamp(3) with time zone,
  	"rd_sync_error" varchar,
  	"unsubscribed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" varchar NOT NULL,
  	"type" "site"."enum_notifications_type" NOT NULL,
  	"title" varchar NOT NULL,
  	"message" varchar,
  	"link" varchar,
  	"read" boolean DEFAULT false,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."email_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"to" varchar NOT NULL,
  	"from" varchar,
  	"subject" varchar NOT NULL,
  	"template_slug" varchar,
  	"status" "site"."enum_email_logs_status" DEFAULT 'queued' NOT NULL,
  	"provider_message_id" varchar,
  	"mode" "site"."enum_email_logs_mode" DEFAULT 'mock-console',
  	"error_message" varchar,
  	"variables" jsonb,
  	"attempts" numeric DEFAULT 1,
  	"sent_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL,
  	"category" "site"."enum_faqs_category" DEFAULT 'geral',
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."calculadora_results" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"empresa" varchar NOT NULL,
  	"cargo" varchar,
  	"telefone" varchar,
  	"setor" "site"."enum_calculadora_results_setor",
  	"lead_id" integer,
  	"calc_investimento_mensal" numeric,
  	"calc_canais_selecionados" jsonb,
  	"calc_ticket_medio" numeric,
  	"calc_modelo_negocio" "site"."enum_calculadora_results_calc_modelo_negocio",
  	"calc_periodo_meses" "site"."enum_calculadora_results_calc_periodo_meses",
  	"calc_crm_funcional" boolean,
  	"calc_premissa_cpl" numeric,
  	"calc_premissa_taxa_qualif" numeric,
  	"calc_premissa_conv_mql_cliente" numeric,
  	"calc_premissa_ciclo_dias" numeric,
  	"calc_premissas_editadas" boolean DEFAULT false,
  	"calc_investimento_total" numeric,
  	"calc_leads_gerados" numeric,
  	"calc_mqls" numeric,
  	"calc_clientes_total" numeric,
  	"calc_clientes_no_periodo" numeric,
  	"calc_clientes_pipeline" numeric,
  	"calc_receita_periodo" numeric,
  	"calc_receita_pipeline" numeric,
  	"calc_roi_periodo" numeric,
  	"calc_roi_total" numeric,
  	"calc_insight_principal" "site"."enum_calculadora_results_calc_insight_principal",
  	"calc_insight_override" boolean DEFAULT false,
  	"calc_url_resultado" varchar,
  	"calc_avancou_para_diagnostico" boolean DEFAULT false,
  	"calc_data_avancou_diagnostico" timestamp(3) with time zone,
  	"nutricao_step_atual" "site"."enum_calculadora_results_nutricao_step_atual" DEFAULT 'pending',
  	"inputs" jsonb,
  	"output" jsonb,
  	"score" numeric,
  	"notified_slack" boolean DEFAULT false,
  	"email_status" "site"."enum_calculadora_results_email_status" DEFAULT 'pending',
  	"rd_sync_status" "site"."enum_calculadora_results_rd_sync_status" DEFAULT 'pending',
  	"consent_given" boolean DEFAULT false NOT NULL,
  	"consent_timestamp" timestamp(3) with time zone,
  	"consent_ip" varchar,
  	"consent_user_agent" varchar,
  	"consent_policy_version" varchar DEFAULT 'v1.0',
  	"consent_withdrawn" boolean DEFAULT false,
  	"consent_withdrawn_at" timestamp(3) with time zone,
  	"retention_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."calculadora_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_name" "site"."enum_calculadora_events_event_name" NOT NULL,
  	"session_id" varchar,
  	"result_token" varchar,
  	"lead_email" varchar,
  	"metadata" jsonb,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from_path" varchar NOT NULL,
  	"to_path" varchar NOT NULL,
  	"type" "site"."enum_redirects_type" DEFAULT '301' NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "site"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."payload_locked_documents_rels" (
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
  	"diagnostico_events_id" integer,
  	"leads_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"ai_prompts_id" integer,
  	"audit_log_id" integer,
  	"testimonials_id" integer,
  	"clients_id" integer,
  	"newsletter_subscribers_id" integer,
  	"notifications_id" integer,
  	"email_logs_id" integer,
  	"faqs_id" integer,
  	"calculadora_results_id" integer,
  	"calculadora_events_id" integer,
  	"redirects_id" integer
  );
  
  CREATE TABLE "site"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "site"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tagline" varchar DEFAULT 'Assessoria de growth para empresas com vendas complexas.',
  	"cidade" varchar DEFAULT 'Maceió – AL · Brasil · Atuação nacional',
  	"logo_id" integer,
  	"logo_dark_id" integer,
  	"favicon_id" integer,
  	"og_image_padrao_id" integer,
  	"email_contato" varchar,
  	"email_notificacoes" varchar,
  	"email_dpo" varchar,
  	"telefone" varchar,
  	"whatsapp" varchar,
  	"linkedin" varchar,
  	"instagram" varchar,
  	"youtube" varchar,
  	"facebook" varchar,
  	"twitter" varchar,
  	"calendar_embed_url" varchar,
  	"calendar_label" varchar DEFAULT 'Agendar diagnóstico gratuito',
  	"calendly_url_fit_alto" varchar,
  	"calendly_url_fit_medio" varchar,
  	"calendly_url_fit_baixo_desfit" varchar,
  	"site_name" varchar DEFAULT 'Unfold Growth',
  	"meta_descricao_padrao" varchar,
  	"keywords_padrao" varchar,
  	"rodape_texto" varchar,
  	"cnpj" varchar,
  	"endereco" varchar,
  	"politica_privacidade" jsonb,
  	"termos_de_uso" jsonb,
  	"lgpd_aviso_cookies" varchar DEFAULT 'Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa Política de Privacidade.',
  	"insights_titulo" varchar DEFAULT 'Insights de crescimento',
  	"insights_subtitulo" varchar DEFAULT 'Diagnóstico, estrutura e operação — os três pilares do método UGS em forma de conhecimento aplicado.',
  	"insights_cta_texto" varchar DEFAULT 'Ver todos os artigos',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site"."site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "site"."home_settings_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"prefix" varchar DEFAULT '+R$ ',
  	"value" numeric NOT NULL,
  	"suffix" varchar DEFAULT 'MM',
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "site"."home_settings_solutions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "site"."enum_home_settings_solutions_icon" DEFAULT 'Target',
  	"title" varchar NOT NULL,
  	"desc" varchar NOT NULL
  );
  
  CREATE TABLE "site"."home_settings_services_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "site"."home_settings_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"numero" varchar DEFAULT '01',
  	"title" varchar NOT NULL,
  	"desc" varchar NOT NULL,
  	"cta_label" varchar DEFAULT 'Ver mais',
  	"cta_href" varchar DEFAULT '/atuacao'
  );
  
  CREATE TABLE "site"."home_settings_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "site"."enum_home_settings_tools_icon" DEFAULT 'Calculator',
  	"title" varchar NOT NULL,
  	"desc" varchar NOT NULL,
  	"cta" varchar DEFAULT 'Saiba mais',
  	"href" varchar NOT NULL,
  	"ai" boolean DEFAULT false
  );
  
  CREATE TABLE "site"."home_settings_partner_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"website" varchar
  );
  
  CREATE TABLE "site"."home_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'Growth Intelligence · Geração de demanda',
  	"hero_title" varchar DEFAULT 'Organizamos crescimento digital em operações com vendas complexas.' NOT NULL,
  	"hero_subtitle" varchar DEFAULT 'Estruturamos sistemas de crescimento que conectam marketing, vendas, CRM e automação em uma lógica integrada, previsível e orientada a resultado comercial.' NOT NULL,
  	"hero_cta_primary_label" varchar DEFAULT 'Solicite um Diagnóstico',
  	"hero_cta_primary_href" varchar DEFAULT '/diagnostico',
  	"hero_cta_secondary_label" varchar DEFAULT 'Conhecer o método',
  	"hero_cta_secondary_href" varchar DEFAULT '/metodo',
  	"hero_video_url" varchar,
  	"hero_image_id" integer,
  	"stats_extra_text" varchar DEFAULT 'Parceiros RD Station, Meta, Kommo',
  	"client_logos_title" varchar DEFAULT 'Empresas que confiam na Unfold',
  	"method_title" varchar DEFAULT 'Um sistema de crescimento, não mais uma série de ações isoladas.',
  	"method_description" varchar DEFAULT 'O Unfold Growth System (UGS) conecta as quatro alavancas do crescimento — Diagnosticar, Estruturar, Operar e Evoluir — em uma operação integrada, previsível e orientada a resultado comercial.',
  	"method_cta_label" varchar DEFAULT 'Conheça o método UGS',
  	"method_cta_href" varchar DEFAULT '/metodo',
  	"final_cta_title" varchar DEFAULT 'Você já tem marketing e vendas. Falta o sistema que conecta tudo.',
  	"final_cta_description" varchar DEFAULT 'Solicite um diagnóstico gratuito. Em até 24h alguém da equipe entra em contato com uma análise inicial da sua operação de crescimento.',
  	"final_cta_button_label" varchar DEFAULT 'Solicite um Diagnóstico',
  	"final_cta_button_href" varchar DEFAULT '/diagnostico',
  	"solutions_eyebrow" varchar DEFAULT 'Para empresas que precisam',
  	"solutions_title" varchar DEFAULT 'Resolvemos os desafios que travam seu crescimento.',
  	"services_eyebrow" varchar DEFAULT 'Como atuamos',
  	"services_title" varchar DEFAULT 'Crescimento como sistema, não como projeto.',
  	"tools_eyebrow" varchar DEFAULT 'Ferramentas',
  	"tools_title" varchar DEFAULT 'Diagnósticos gratuitos para destravar seu crescimento.',
  	"ocultar_depoimentos" boolean DEFAULT false,
  	"testimonials_eyebrow" varchar DEFAULT 'Depoimentos',
  	"testimonials_title" varchar DEFAULT 'O que dizem os clientes que organizaram o crescimento com a Unfold.',
  	"partners_eyebrow" varchar DEFAULT 'Parceiros e certificações',
  	"partners_title" varchar DEFAULT 'Parceiros oficiais',
  	"partners_footer_text" varchar DEFAULT 'Não achou sua ferramenta ou tecnologia? Possuímos um setor interno de tecnologia pronto para se adaptar à realidade do seu negócio.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "site"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."cases_highlights" ADD CONSTRAINT "cases_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."cases_pillars_acoes" ADD CONSTRAINT "cases_pillars_acoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."cases_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."cases_pillars" ADD CONSTRAINT "cases_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."cases_results" ADD CONSTRAINT "cases_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."cases" ADD CONSTRAINT "cases_imagem_destaque_id_media_id_fk" FOREIGN KEY ("imagem_destaque_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."quiz_questions_opcoes" ADD CONSTRAINT "quiz_questions_opcoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."diagnostico_results" ADD CONSTRAINT "diagnostico_results_lead_id_id_leads_id_fk" FOREIGN KEY ("lead_id_id") REFERENCES "site"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."diagnostico_results" ADD CONSTRAINT "diagnostico_results_insight_id_id_insights_variations_id_fk" FOREIGN KEY ("insight_id_id") REFERENCES "site"."insights_variations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."leads" ADD CONSTRAINT "leads_diagnostico_result_id_id_diagnostico_results_id_fk" FOREIGN KEY ("diagnostico_result_id_id") REFERENCES "site"."diagnostico_results"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."posts_tags" ADD CONSTRAINT "posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."posts" ADD CONSTRAINT "posts_categoria_id_categories_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "site"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."posts" ADD CONSTRAINT "posts_imagem_destaque_id_media_id_fk" FOREIGN KEY ("imagem_destaque_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."testimonials" ADD CONSTRAINT "testimonials_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."testimonials" ADD CONSTRAINT "testimonials_logo_empresa_id_media_id_fk" FOREIGN KEY ("logo_empresa_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."clients" ADD CONSTRAINT "clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."calculadora_results" ADD CONSTRAINT "calculadora_results_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "site"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "site"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "site"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "site"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cases_fk" FOREIGN KEY ("cases_id") REFERENCES "site"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quiz_questions_fk" FOREIGN KEY ("quiz_questions_id") REFERENCES "site"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insights_variations_fk" FOREIGN KEY ("insights_variations_id") REFERENCES "site"."insights_variations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_diagnostico_results_fk" FOREIGN KEY ("diagnostico_results_id") REFERENCES "site"."diagnostico_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_diagnostico_events_fk" FOREIGN KEY ("diagnostico_events_id") REFERENCES "site"."diagnostico_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "site"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "site"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "site"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_prompts_fk" FOREIGN KEY ("ai_prompts_id") REFERENCES "site"."ai_prompts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "site"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "site"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "site"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "site"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "site"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_logs_fk" FOREIGN KEY ("email_logs_id") REFERENCES "site"."email_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "site"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_calculadora_results_fk" FOREIGN KEY ("calculadora_results_id") REFERENCES "site"."calculadora_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_calculadora_events_fk" FOREIGN KEY ("calculadora_events_id") REFERENCES "site"."calculadora_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "site"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "site"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "site"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."site_settings" ADD CONSTRAINT "site_settings_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."site_settings" ADD CONSTRAINT "site_settings_og_image_padrao_id_media_id_fk" FOREIGN KEY ("og_image_padrao_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "site"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."site_settings_rels" ADD CONSTRAINT "site_settings_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "site"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."home_settings_stats" ADD CONSTRAINT "home_settings_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."home_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."home_settings_solutions" ADD CONSTRAINT "home_settings_solutions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."home_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."home_settings_services_bullets" ADD CONSTRAINT "home_settings_services_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."home_settings_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."home_settings_services" ADD CONSTRAINT "home_settings_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."home_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."home_settings_tools" ADD CONSTRAINT "home_settings_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."home_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."home_settings_partner_logos" ADD CONSTRAINT "home_settings_partner_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site"."home_settings_partner_logos" ADD CONSTRAINT "home_settings_partner_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site"."home_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site"."home_settings" ADD CONSTRAINT "home_settings_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "site"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "site"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "site"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "site"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "site"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "site"."users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "site"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "site"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "site"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "site"."media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "site"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "site"."media" USING btree ("sizes_og_filename");
  CREATE INDEX "cases_highlights_order_idx" ON "site"."cases_highlights" USING btree ("_order");
  CREATE INDEX "cases_highlights_parent_id_idx" ON "site"."cases_highlights" USING btree ("_parent_id");
  CREATE INDEX "cases_pillars_acoes_order_idx" ON "site"."cases_pillars_acoes" USING btree ("_order");
  CREATE INDEX "cases_pillars_acoes_parent_id_idx" ON "site"."cases_pillars_acoes" USING btree ("_parent_id");
  CREATE INDEX "cases_pillars_order_idx" ON "site"."cases_pillars" USING btree ("_order");
  CREATE INDEX "cases_pillars_parent_id_idx" ON "site"."cases_pillars" USING btree ("_parent_id");
  CREATE INDEX "cases_results_order_idx" ON "site"."cases_results" USING btree ("_order");
  CREATE INDEX "cases_results_parent_id_idx" ON "site"."cases_results" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cases_slug_idx" ON "site"."cases" USING btree ("slug");
  CREATE INDEX "cases_imagem_destaque_idx" ON "site"."cases" USING btree ("imagem_destaque_id");
  CREATE INDEX "cases_updated_at_idx" ON "site"."cases" USING btree ("updated_at");
  CREATE INDEX "cases_created_at_idx" ON "site"."cases" USING btree ("created_at");
  CREATE INDEX "quiz_questions_opcoes_order_idx" ON "site"."quiz_questions_opcoes" USING btree ("_order");
  CREATE INDEX "quiz_questions_opcoes_parent_id_idx" ON "site"."quiz_questions_opcoes" USING btree ("_parent_id");
  CREATE INDEX "quiz_questions_updated_at_idx" ON "site"."quiz_questions" USING btree ("updated_at");
  CREATE INDEX "quiz_questions_created_at_idx" ON "site"."quiz_questions" USING btree ("created_at");
  CREATE INDEX "insights_variations_featured_idx" ON "site"."insights_variations" USING btree ("featured");
  CREATE INDEX "insights_variations_updated_at_idx" ON "site"."insights_variations" USING btree ("updated_at");
  CREATE INDEX "insights_variations_created_at_idx" ON "site"."insights_variations" USING btree ("created_at");
  CREATE INDEX "diagnostico_results_lead_id_idx" ON "site"."diagnostico_results" USING btree ("lead_id_id");
  CREATE INDEX "diagnostico_results_insight_id_idx" ON "site"."diagnostico_results" USING btree ("insight_id_id");
  CREATE UNIQUE INDEX "diagnostico_results_url_resultado_hash_idx" ON "site"."diagnostico_results" USING btree ("url_resultado_hash");
  CREATE INDEX "diagnostico_results_updated_at_idx" ON "site"."diagnostico_results" USING btree ("updated_at");
  CREATE INDEX "diagnostico_results_created_at_idx" ON "site"."diagnostico_results" USING btree ("created_at");
  CREATE INDEX "diagnostico_events_event_name_idx" ON "site"."diagnostico_events" USING btree ("event_name");
  CREATE INDEX "diagnostico_events_session_id_idx" ON "site"."diagnostico_events" USING btree ("session_id");
  CREATE INDEX "diagnostico_events_result_hash_idx" ON "site"."diagnostico_events" USING btree ("result_hash");
  CREATE INDEX "diagnostico_events_lead_email_idx" ON "site"."diagnostico_events" USING btree ("lead_email");
  CREATE INDEX "diagnostico_events_updated_at_idx" ON "site"."diagnostico_events" USING btree ("updated_at");
  CREATE INDEX "diagnostico_events_created_at_idx" ON "site"."diagnostico_events" USING btree ("created_at");
  CREATE INDEX "leads_diagnostico_result_id_idx" ON "site"."leads" USING btree ("diagnostico_result_id_id");
  CREATE INDEX "leads_updated_at_idx" ON "site"."leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "site"."leads" USING btree ("created_at");
  CREATE INDEX "posts_tags_order_idx" ON "site"."posts_tags" USING btree ("_order");
  CREATE INDEX "posts_tags_parent_id_idx" ON "site"."posts_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "site"."posts" USING btree ("slug");
  CREATE INDEX "posts_categoria_idx" ON "site"."posts" USING btree ("categoria_id");
  CREATE INDEX "posts_imagem_destaque_idx" ON "site"."posts" USING btree ("imagem_destaque_id");
  CREATE INDEX "posts_destaque_home_idx" ON "site"."posts" USING btree ("destaque_home");
  CREATE INDEX "posts_is_external_submission_idx" ON "site"."posts" USING btree ("is_external_submission");
  CREATE INDEX "posts_updated_at_idx" ON "site"."posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "site"."posts" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "site"."categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "site"."categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "site"."categories" USING btree ("created_at");
  CREATE INDEX "ai_prompts_updated_at_idx" ON "site"."ai_prompts" USING btree ("updated_at");
  CREATE INDEX "ai_prompts_created_at_idx" ON "site"."ai_prompts" USING btree ("created_at");
  CREATE INDEX "audit_log_updated_at_idx" ON "site"."audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "site"."audit_log" USING btree ("created_at");
  CREATE INDEX "testimonials_foto_idx" ON "site"."testimonials" USING btree ("foto_id");
  CREATE INDEX "testimonials_logo_empresa_idx" ON "site"."testimonials" USING btree ("logo_empresa_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "site"."testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "site"."testimonials" USING btree ("created_at");
  CREATE INDEX "clients_logo_idx" ON "site"."clients" USING btree ("logo_id");
  CREATE INDEX "clients_updated_at_idx" ON "site"."clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "site"."clients" USING btree ("created_at");
  CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "site"."newsletter_subscribers" USING btree ("email");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "site"."newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "site"."newsletter_subscribers" USING btree ("created_at");
  CREATE INDEX "notifications_user_id_idx" ON "site"."notifications" USING btree ("user_id");
  CREATE INDEX "notifications_read_idx" ON "site"."notifications" USING btree ("read");
  CREATE INDEX "notifications_updated_at_idx" ON "site"."notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "site"."notifications" USING btree ("created_at");
  CREATE INDEX "email_logs_to_idx" ON "site"."email_logs" USING btree ("to");
  CREATE INDEX "email_logs_template_slug_idx" ON "site"."email_logs" USING btree ("template_slug");
  CREATE INDEX "email_logs_updated_at_idx" ON "site"."email_logs" USING btree ("updated_at");
  CREATE INDEX "email_logs_created_at_idx" ON "site"."email_logs" USING btree ("created_at");
  CREATE INDEX "faqs_published_idx" ON "site"."faqs" USING btree ("published");
  CREATE INDEX "faqs_updated_at_idx" ON "site"."faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "site"."faqs" USING btree ("created_at");
  CREATE INDEX "calculadora_results_nome_idx" ON "site"."calculadora_results" USING btree ("nome");
  CREATE INDEX "calculadora_results_email_idx" ON "site"."calculadora_results" USING btree ("email");
  CREATE INDEX "calculadora_results_setor_idx" ON "site"."calculadora_results" USING btree ("setor");
  CREATE INDEX "calculadora_results_lead_idx" ON "site"."calculadora_results" USING btree ("lead_id");
  CREATE INDEX "calculadora_results_calc_insight_principal_idx" ON "site"."calculadora_results" USING btree ("calc_insight_principal");
  CREATE UNIQUE INDEX "calculadora_results_calc_url_resultado_idx" ON "site"."calculadora_results" USING btree ("calc_url_resultado");
  CREATE INDEX "calculadora_results_calc_avancou_para_diagnostico_idx" ON "site"."calculadora_results" USING btree ("calc_avancou_para_diagnostico");
  CREATE INDEX "calculadora_results_notified_slack_idx" ON "site"."calculadora_results" USING btree ("notified_slack");
  CREATE INDEX "calculadora_results_updated_at_idx" ON "site"."calculadora_results" USING btree ("updated_at");
  CREATE INDEX "calculadora_results_created_at_idx" ON "site"."calculadora_results" USING btree ("created_at");
  CREATE INDEX "calculadora_events_event_name_idx" ON "site"."calculadora_events" USING btree ("event_name");
  CREATE INDEX "calculadora_events_session_id_idx" ON "site"."calculadora_events" USING btree ("session_id");
  CREATE INDEX "calculadora_events_result_token_idx" ON "site"."calculadora_events" USING btree ("result_token");
  CREATE INDEX "calculadora_events_lead_email_idx" ON "site"."calculadora_events" USING btree ("lead_email");
  CREATE INDEX "calculadora_events_updated_at_idx" ON "site"."calculadora_events" USING btree ("updated_at");
  CREATE INDEX "calculadora_events_created_at_idx" ON "site"."calculadora_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_path_idx" ON "site"."redirects" USING btree ("from_path");
  CREATE INDEX "redirects_enabled_idx" ON "site"."redirects" USING btree ("enabled");
  CREATE INDEX "redirects_updated_at_idx" ON "site"."redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "site"."redirects" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "site"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "site"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "site"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "site"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "site"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "site"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "site"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_cases_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("cases_id");
  CREATE INDEX "payload_locked_documents_rels_quiz_questions_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("quiz_questions_id");
  CREATE INDEX "payload_locked_documents_rels_insights_variations_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("insights_variations_id");
  CREATE INDEX "payload_locked_documents_rels_diagnostico_results_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("diagnostico_results_id");
  CREATE INDEX "payload_locked_documents_rels_diagnostico_events_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("diagnostico_events_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_ai_prompts_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("ai_prompts_id");
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("audit_log_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_locked_documents_rels_email_logs_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("email_logs_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_calculadora_results_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("calculadora_results_id");
  CREATE INDEX "payload_locked_documents_rels_calculadora_events_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("calculadora_events_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "site"."payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "site"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "site"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "site"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "site"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "site"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "site"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "site"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "site"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "site"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_logo_idx" ON "site"."site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_dark_idx" ON "site"."site_settings" USING btree ("logo_dark_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site"."site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_og_image_padrao_idx" ON "site"."site_settings" USING btree ("og_image_padrao_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site"."site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site"."site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site"."site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_posts_id_idx" ON "site"."site_settings_rels" USING btree ("posts_id");
  CREATE INDEX "home_settings_stats_order_idx" ON "site"."home_settings_stats" USING btree ("_order");
  CREATE INDEX "home_settings_stats_parent_id_idx" ON "site"."home_settings_stats" USING btree ("_parent_id");
  CREATE INDEX "home_settings_solutions_order_idx" ON "site"."home_settings_solutions" USING btree ("_order");
  CREATE INDEX "home_settings_solutions_parent_id_idx" ON "site"."home_settings_solutions" USING btree ("_parent_id");
  CREATE INDEX "home_settings_services_bullets_order_idx" ON "site"."home_settings_services_bullets" USING btree ("_order");
  CREATE INDEX "home_settings_services_bullets_parent_id_idx" ON "site"."home_settings_services_bullets" USING btree ("_parent_id");
  CREATE INDEX "home_settings_services_order_idx" ON "site"."home_settings_services" USING btree ("_order");
  CREATE INDEX "home_settings_services_parent_id_idx" ON "site"."home_settings_services" USING btree ("_parent_id");
  CREATE INDEX "home_settings_tools_order_idx" ON "site"."home_settings_tools" USING btree ("_order");
  CREATE INDEX "home_settings_tools_parent_id_idx" ON "site"."home_settings_tools" USING btree ("_parent_id");
  CREATE INDEX "home_settings_partner_logos_order_idx" ON "site"."home_settings_partner_logos" USING btree ("_order");
  CREATE INDEX "home_settings_partner_logos_parent_id_idx" ON "site"."home_settings_partner_logos" USING btree ("_parent_id");
  CREATE INDEX "home_settings_partner_logos_logo_idx" ON "site"."home_settings_partner_logos" USING btree ("logo_id");
  CREATE INDEX "home_settings_hero_image_idx" ON "site"."home_settings" USING btree ("hero_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site"."users_sessions" CASCADE;
  DROP TABLE "site"."users" CASCADE;
  DROP TABLE "site"."media" CASCADE;
  DROP TABLE "site"."cases_highlights" CASCADE;
  DROP TABLE "site"."cases_pillars_acoes" CASCADE;
  DROP TABLE "site"."cases_pillars" CASCADE;
  DROP TABLE "site"."cases_results" CASCADE;
  DROP TABLE "site"."cases" CASCADE;
  DROP TABLE "site"."quiz_questions_opcoes" CASCADE;
  DROP TABLE "site"."quiz_questions" CASCADE;
  DROP TABLE "site"."insights_variations" CASCADE;
  DROP TABLE "site"."diagnostico_results" CASCADE;
  DROP TABLE "site"."diagnostico_events" CASCADE;
  DROP TABLE "site"."leads" CASCADE;
  DROP TABLE "site"."posts_tags" CASCADE;
  DROP TABLE "site"."posts" CASCADE;
  DROP TABLE "site"."categories" CASCADE;
  DROP TABLE "site"."ai_prompts" CASCADE;
  DROP TABLE "site"."audit_log" CASCADE;
  DROP TABLE "site"."testimonials" CASCADE;
  DROP TABLE "site"."clients" CASCADE;
  DROP TABLE "site"."newsletter_subscribers" CASCADE;
  DROP TABLE "site"."notifications" CASCADE;
  DROP TABLE "site"."email_logs" CASCADE;
  DROP TABLE "site"."faqs" CASCADE;
  DROP TABLE "site"."calculadora_results" CASCADE;
  DROP TABLE "site"."calculadora_events" CASCADE;
  DROP TABLE "site"."redirects" CASCADE;
  DROP TABLE "site"."payload_kv" CASCADE;
  DROP TABLE "site"."payload_locked_documents" CASCADE;
  DROP TABLE "site"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "site"."payload_preferences" CASCADE;
  DROP TABLE "site"."payload_preferences_rels" CASCADE;
  DROP TABLE "site"."payload_migrations" CASCADE;
  DROP TABLE "site"."site_settings" CASCADE;
  DROP TABLE "site"."site_settings_rels" CASCADE;
  DROP TABLE "site"."home_settings_stats" CASCADE;
  DROP TABLE "site"."home_settings_solutions" CASCADE;
  DROP TABLE "site"."home_settings_services_bullets" CASCADE;
  DROP TABLE "site"."home_settings_services" CASCADE;
  DROP TABLE "site"."home_settings_tools" CASCADE;
  DROP TABLE "site"."home_settings_partner_logos" CASCADE;
  DROP TABLE "site"."home_settings" CASCADE;
  DROP TYPE "site"."enum_users_role";
  DROP TYPE "site"."enum_cases_pillars_pilar";
  DROP TYPE "site"."enum_cases_vertical";
  DROP TYPE "site"."enum_cases_status";
  DROP TYPE "site"."enum_quiz_questions_pilar";
  DROP TYPE "site"."enum_insights_variations_nivel_fit";
  DROP TYPE "site"."enum_insights_variations_pilar";
  DROP TYPE "site"."enum_diagnostico_results_nivel_fit";
  DROP TYPE "site"."enum_diagnostico_results_faixa_consolidada";
  DROP TYPE "site"."enum_diagnostico_results_faixa_fit";
  DROP TYPE "site"."enum_diagnostico_events_event_name";
  DROP TYPE "site"."enum_leads_tamanho_equipe";
  DROP TYPE "site"."enum_leads_receita_anual";
  DROP TYPE "site"."enum_leads_setor";
  DROP TYPE "site"."enum_leads_faturamento_faixa";
  DROP TYPE "site"."enum_leads_urgencia";
  DROP TYPE "site"."enum_leads_origem";
  DROP TYPE "site"."enum_leads_rd_sync_status";
  DROP TYPE "site"."enum_posts_pilar";
  DROP TYPE "site"."enum_posts_status";
  DROP TYPE "site"."enum_categories_pilar";
  DROP TYPE "site"."enum_ai_prompts_tipo";
  DROP TYPE "site"."enum_audit_log_acao";
  DROP TYPE "site"."enum_audit_log_status";
  DROP TYPE "site"."enum_testimonials_vertical";
  DROP TYPE "site"."enum_newsletter_subscribers_status";
  DROP TYPE "site"."enum_newsletter_subscribers_rd_sync_status";
  DROP TYPE "site"."enum_notifications_type";
  DROP TYPE "site"."enum_email_logs_status";
  DROP TYPE "site"."enum_email_logs_mode";
  DROP TYPE "site"."enum_faqs_category";
  DROP TYPE "site"."enum_calculadora_results_setor";
  DROP TYPE "site"."enum_calculadora_results_calc_modelo_negocio";
  DROP TYPE "site"."enum_calculadora_results_calc_periodo_meses";
  DROP TYPE "site"."enum_calculadora_results_calc_insight_principal";
  DROP TYPE "site"."enum_calculadora_results_nutricao_step_atual";
  DROP TYPE "site"."enum_calculadora_results_email_status";
  DROP TYPE "site"."enum_calculadora_results_rd_sync_status";
  DROP TYPE "site"."enum_calculadora_events_event_name";
  DROP TYPE "site"."enum_redirects_type";
  DROP TYPE "site"."enum_home_settings_solutions_icon";
  DROP TYPE "site"."enum_home_settings_tools_icon";`)
}
