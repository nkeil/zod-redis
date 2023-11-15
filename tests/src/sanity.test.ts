import { expect, test } from 'vitest';
import { z } from 'zod';
import { ZRedis } from '../../src/index';
import { assertEqual, assertIs } from './utils';

const zredis = new ZRedis(6379, '127.0.0.1', {
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

test('sanity test', async () => {
  const birthdayKey = zredis.model('birthday').getKey('12345');
  assertIs<'birthday:12345'>(birthdayKey);

  const birthdayModel = zredis.model('birthday');
  type SetArg1 = Parameters<typeof birthdayModel.set>[0];
  type SetArg2 = Parameters<typeof birthdayModel.set>[1];
  assertEqual<SetArg1, `birthday:${string}`>(true);
  assertEqual<SetArg2, Date>(true);

  const date = new Date(2015, 0, 5);
  await zredis.model('birthday').set(birthdayKey, date);
  const result = await zredis.model('birthday').get(birthdayKey);

  assertIs<Date | null>(result);
  expect(result).toEqual(date);

  await zredis.set('birthday:12345', 'this is not a date');

  const result2 = await zredis.model('birthday').get(birthdayKey);
  expect(result2).toEqual(null);

  const result3 = await zredis.get(birthdayKey);
  expect(result3).toEqual('this is not a date');
});
