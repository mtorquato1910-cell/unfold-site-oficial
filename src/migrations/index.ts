import * as migration_20260515_135200_initial_site_schema from './20260515_135200_initial_site_schema';
import * as migration_20260518_170021_rd_telefone_newsletter from './20260518_170021_rd_telefone_newsletter';

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
];
