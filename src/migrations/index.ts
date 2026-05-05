import * as migration_20260504_184239 from './20260504_184239';
import * as migration_20260505_124734 from './20260505_124734';

export const migrations = [
  {
    up: migration_20260504_184239.up,
    down: migration_20260504_184239.down,
    name: '20260504_184239',
  },
  {
    up: migration_20260505_124734.up,
    down: migration_20260505_124734.down,
    name: '20260505_124734'
  },
];
