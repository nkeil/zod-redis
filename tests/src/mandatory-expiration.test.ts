import { expect, test } from 'vitest';
import { z } from 'zod';
import { ZRedis } from '../../src';
import { SchemaModel } from '../../src/types';

const birthdaySchema = {
  zod: z.date(),
  getKey: (userId: string) => `birthday:${userId}`,
} satisfies SchemaModel;

test('mandatory expiration', () => {
  expect(
    () => new ZRedis({ schema: { birthday: birthdaySchema } }),
  ).not.toThrowError();

  expect(
    () =>
      // @ts-expect-error This should cause a type error
      new ZRedis({
        schema: { birthday: birthdaySchema },
        mandatoryExpiration: true,
      }),
  ).toThrowError();

  expect(
    () =>
      new ZRedis({
        schema: { birthday: { ...birthdaySchema, expirationSeconds: 30 } },
        mandatoryExpiration: true,
      }),
  ).not.toThrowError();
});
