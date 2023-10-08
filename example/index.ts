import Redis from "ioredis";
import { ZRedis } from "../src/index";
import { z } from "zod";

const zredis = new ZRedis(new Redis(), {
  birthday: {
    zod: z.date(),
    getKey: <T extends string>(userId: T) => `birthday:${userId}` as const,
    expirationSeconds: 30,
  },
});

const birthdayKey = zredis.model("birthday").getKey("12345");
await zredis.model("birthday").set(birthdayKey, new Date(2015, 0, 5));

const result = await zredis.model("birthday").get(birthdayKey);
console.log(result?.toDateString());

process.exit(0);
