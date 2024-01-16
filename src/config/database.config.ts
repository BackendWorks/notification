import { registerAs } from '@nestjs/config';

export default registerAs(
  'db',
  (): Record<string, any> => ({
    uri: process.env.DATABASE_URL,
  }),
);
