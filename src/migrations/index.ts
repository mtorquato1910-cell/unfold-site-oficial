import * as migration_20260515_135200_initial_site_schema from './20260515_135200_initial_site_schema';
import * as migration_20260518_170021_rd_telefone_newsletter from './20260518_170021_rd_telefone_newsletter';
import * as migration_20260615_120000_rich_html_fields from './20260615_120000_rich_html_fields';
import * as migration_20260615_180000_banners_table from './20260615_180000_banners_table';

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
];
