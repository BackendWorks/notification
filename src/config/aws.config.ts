import { registerAs } from '@nestjs/config';

export default registerAs(
  'aws',
  (): Record<string, unknown> => ({
    ses: {
      region: process.env.AWS_SES_REGION,
      accessKeyId: process.env.AWS_SES_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SES_SECRET_KEY,

      sourceEmail: process.env.AWS_SES_SOURCE_EMAIL,
    },
    sns: {
      region: process.env.AWS_SES_REGION,
      accessKeyId: process.env.AWS_SES_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SES_SECRET_KEY,
    },
  }),
);
