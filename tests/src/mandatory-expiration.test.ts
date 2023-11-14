import { z } from 'zod';
import { ZRedis } from '../../src';

const _zredis1 = new ZRedis(6379, '127.0.0.1', {
  schema: {
    birthday: {
      zod: z.date(),
      getKey: <T extends string>(userId: T) => {
        return `birthday:${userId}` as const;
      },
      expirationSeconds: 30,
    },
  },
});

const _zredis2 = new ZRedis(6379, '127.0.0.1', {
  schema: {
    birthday: {
      zod: z.date(),
      getKey: <T extends string>(userId: T) => {
        return `birthday:${userId}` as const;
      },
      expirationSeconds: 30,
    },
  },
  mandatoryExpiration: true,
});

// @ts-expect-error This should cause an error
const _zredis3 = new ZRedis(6379, '127.0.0.1', {
  schema: {
    birthday: {
      zod: z.date(),
      getKey: <T extends string>(userId: T) => {
        return `birthday:${userId}` as const;
      },
    },
  },
  mandatoryExpiration: true,
});
