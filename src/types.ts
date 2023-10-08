import { RedisOptions } from "ioredis";
import { z } from "zod";
import { ZodTypeAny } from "zod";

export type SchemaModel = {
  zod: ZodTypeAny;
  getKey: (...args: any[]) => string;
  expirationSeconds?: number;
};
export type Schema = Record<string, SchemaModel>;

export type ModelName<TSchema extends Schema> = keyof TSchema;
export type Key<TModel extends SchemaModel> = ReturnType<TModel["getKey"]>;
export type Value<TModel extends SchemaModel> = z.infer<TModel["zod"]>;

export type ZRedisOptions<TSchema extends Schema> = RedisOptions & {
  schema?: TSchema;
};
