import { registerAs } from '@nestjs/config';

export default registerAs(
  'novu',
  (): Record<string, any> => ({
    key: process.env.NOVU_API_KEY,
  }),
);
