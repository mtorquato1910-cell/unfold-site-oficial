import * as migration_20260515_135200_initial_site_schema from './20260515_135200_initial_site_schema';

export const migrations = [
  {
    up: migration_20260515_135200_initial_site_schema.up,
    down: migration_20260515_135200_initial_site_schema.down,
    name: '20260515_135200_initial_site_schema'
  },
];
