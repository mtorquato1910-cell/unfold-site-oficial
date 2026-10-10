import * as migration_20260515_135200_initial_site_schema from './20260515_135200_initial_site_schema';
import * as migration_20260518_170021_rd_telefone_newsletter from './20260518_170021_rd_telefone_newsletter';
import * as migration_20260615_120000_rich_html_fields from './20260615_120000_rich_html_fields';
import * as migration_20260615_180000_banners_table from './20260615_180000_banners_table';
import * as migration_20260701_120000_tracking_events from './20260701_120000_tracking_events';
import * as migration_20260710_140000_fix_locked_docs_tracking_events from './20260710_140000_fix_locked_docs_tracking_events';
import * as migration_20260715_120000_heatmap_events from './20260715_120000_heatmap_events';
import * as migration_20260717_120000_site_texts_global from './20260717_120000_site_texts_global';
import * as migration_20260807_120000_posts_seo_fields from './20260807_120000_posts_seo_fields';
import * as migration_20260807_130000_posts_faq from './20260807_130000_posts_faq';
import * as migration_20261010_120000_posts_content_updated_at from './20261010_120000_posts_content_updated_at';
import * as migration_20261010_130000_authors from './20261010_130000_authors';
import * as migration_20261010_140000_cases_rich from './20261010_140000_cases_rich';

export const migrations = [
  {
    up: migration_20260515_135200_initial_site_schema.up,
    down: migration_20260515_135200_initial_site_schema.down,
    name: '20260515_135200_initial_site_schema',
  },
  {
    up: migration_20260518_170021_rd_telefone_newsletter.up,
    down: migration_20260518_170021_rd_telefone_newsletter.down,
    name: '20260518_170021_rd_telefone_newsletter'
  },
  {
    up: migration_20260615_120000_rich_html_fields.up,
    down: migration_20260615_120000_rich_html_fields.down,
    name: '20260615_120000_rich_html_fields'
  },
  {
    up: migration_20260615_180000_banners_table.up,
    down: migration_20260615_180000_banners_table.down,
    name: '20260615_180000_banners_table'
  },
  {
    up: migration_20260701_120000_tracking_events.up,
    down: migration_20260701_120000_tracking_events.down,
    name: '20260701_120000_tracking_events'
  },
  {
    up: migration_20260710_140000_fix_locked_docs_tracking_events.up,
    down: migration_20260710_140000_fix_locked_docs_tracking_events.down,
    name: '20260710_140000_fix_locked_docs_tracking_events'
  },
  {
    up: migration_20260715_120000_heatmap_events.up,
    down: migration_20260715_120000_heatmap_events.down,
    name: '20260715_120000_heatmap_events'
  },
  {
    up: migration_20260717_120000_site_texts_global.up,
    down: migration_20260717_120000_site_texts_global.down,
    name: '20260717_120000_site_texts_global'
  },
  {
    up: migration_20260807_120000_posts_seo_fields.up,
    down: migration_20260807_120000_posts_seo_fields.down,
    name: '20260807_120000_posts_seo_fields'
  },
  {
    up: migration_20260807_130000_posts_faq.up,
    down: migration_20260807_130000_posts_faq.down,
    name: '20260807_130000_posts_faq'
  },
  {
    up: migration_20261010_120000_posts_content_updated_at.up,
    down: migration_20261010_120000_posts_content_updated_at.down,
    name: '20261010_120000_posts_content_updated_at'
  },
  {
    up: migration_20261010_130000_authors.up,
    down: migration_20261010_130000_authors.down,
    name: '20261010_130000_authors'
  },
  {
    up: migration_20261010_140000_cases_rich.up,
    down: migration_20261010_140000_cases_rich.down,
    name: '20261010_140000_cases_rich'
  },
];
