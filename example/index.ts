import { Schema, ZRedis } from "../src/index";
import { z } from "zod";

const schema = {
  birthday: {
    zod: z.date(),
    getKey: <T extends string>(userId: T) => {
      return `birthday:${userId}` as const;
    },
    expirationSeconds: 30,
  },
} satisfies Schema;

/**
 * Test behavior of standard Redis functions for comparison
 */
// const redis = new Redis(6380);
// await redis.set("birthday:12345", "test");
// const result = await redis.get("birthday:12345");
// console.log(result);

const zredis = new ZRedis(6379, "127.0.0.1", { schema });

const birthdayKey = zredis.model("birthday").getKey("12345");

// The following lines should error:
// await zredis.model("birthday").set("birthday;12345", new Date(2015, 0, 5));
// await zredis.model("birthday").set(birthdayKey, '2023-10-08T00:36:30.104Z');

await zredis.model("birthday").set(birthdayKey, new Date(2015, 0, 5));

const result = await zredis.model("birthday").get(birthdayKey);
console.log(result?.toDateString());

process.exit(0);
