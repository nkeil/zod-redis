import { Redis } from "ioredis";
import { ZodTypeAny, z } from "zod";
import superjson from "superjson";

type SchemaModel = {
  zod: ZodTypeAny;
  getKey: (...args: string[]) => string;
  expirationSeconds?: number;
};
type Schema = Record<string, SchemaModel>;

type ModelName<TSchema extends Schema> = keyof TSchema;
type Key<
  TSchema extends Schema,
  TModel extends ModelName<TSchema>,
> = ReturnType<TSchema[TModel]["getKey"]>;
type Value<TSchema extends Schema, TModel extends ModelName<TSchema>> = z.infer<
  TSchema[TModel]["zod"]
>;

export class ZRedis<TSchema extends Schema> {
  constructor(
    private redis: Redis,
    private schema: TSchema
  ) {}

  model<TModel extends ModelName<TSchema>>(model: TModel) {
    return new Model(this.redis, this.schema, model);
  }
}

class Model<TSchema extends Schema, TModel extends ModelName<TSchema>> {
  private model: SchemaModel;
  public getKey: TSchema[TModel]["getKey"];

  constructor(
    private redis: Redis,
    schema: TSchema,
    model: TModel
  ) {
    this.model = schema[model];
    this.getKey = this.model.getKey;
  }

  /**
   * Create or update a model instance.
   * @param model The name of the model you are querying for
   * @param key A string targeting the specific model instance
   * @param value The value you will be storing under `key`
   */
  async set(key: Key<TSchema, TModel>, value: Value<TSchema, TModel>) {
    const expirationSeconds = this.model.expirationSeconds;
    const result = await this.redis.set(key, superjson.stringify(value));
    if (expirationSeconds !== undefined) {
      await this.redis.expire(key, expirationSeconds);
    }
    return result;
  }

  /**
   * Retrieve a model instance.
   * @param model The name of the model you are querying for
   * @param key A string targeting the specific model instance
   */
  async get(key: Key<TSchema, TModel>) {
    try {
      const zodString = await this.redis.get(key);
      if (!zodString) return null;
      const zodResponse = this.model.zod.safeParse(superjson.parse(zodString));
      if (!zodResponse.success) return null;
      return zodResponse.data as Value<TSchema, TModel>;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
