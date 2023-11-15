import { Redis } from 'ioredis';
import superjson from 'superjson';
import {
  GetSchema,
  Key,
  ModelName,
  Schema,
  SchemaModel,
  Value,
  ZRedisOptions,
} from './types';

export { type Schema } from './types';

export class ZRedis<
  TOptions extends ZRedisOptions,
  TSchema extends Schema = GetSchema<TOptions>,
> extends Redis {
  private schema?: TSchema;

  constructor(port: number, host: string, options: TOptions);
  constructor(path: string, options: TOptions);
  constructor(port: number, options: TOptions);
  constructor(port: number, host: string);
  constructor(options: TOptions);
  constructor(port: number);
  constructor(path: string);
  constructor();
  constructor(
    arg1?: number | string | TOptions,
    arg2?: string | TOptions,
    arg3?: TOptions,
  ) {
    // @ts-expect-error Constructor args are the same as ioredis
    super(...[arg1, arg2, arg3].filter((arg) => arg !== undefined));
    for (const arg of [arg1, arg2, arg3]) {
      if (typeof arg === 'object') {
        this.schema = arg.schema as TSchema | undefined;

        // Verify mandatory expiration option
        if (arg.schema && arg.mandatoryExpiration) {
          for (const [name, model] of Object.entries(arg.schema)) {
            if (model.expirationSeconds === undefined) {
              throw new Error(
                `Mandatory expiration was turned on, and a missing expiration was found on model ${name}!`,
              );
            }
          }
        }
      }
    }
  }

  model<TModel extends ModelName<TSchema>>(model: TModel) {
    if (!this.schema?.[model]) {
      throw new Error('Tried to access a nonexistent model!');
    }
    return new Model(this, this.schema[model]);
  }
}

class Model<TModel extends SchemaModel> {
  public getKey: TModel['getKey'];

  constructor(
    private redis: Redis,
    private model: TModel,
  ) {
    this.getKey = model.getKey;
  }

  /**
   * Create or update a model instance.
   * @param model The name of the model you are querying for
   * @param key A string targeting the specific model instance
   * @param value The value you will be storing under `key`
   */
  async set(key: Key<TModel>, value: Value<TModel>) {
    try {
      const expirationSeconds = this.model.expirationSeconds;
      const result = await this.redis.set(key, superjson.stringify(value));
      if (expirationSeconds !== undefined) {
        await this.redis.expire(key, expirationSeconds);
      }
      return result;
    } catch (e) {
      console.error('Error in model.set:');
      console.error(e);
      return;
    }
  }

  /**
   * Retrieve a model instance.
   * @param model The name of the model you are querying for
   * @param key A string targeting the specific model instance
   */
  async get(key: Key<TModel>) {
    try {
      const zodString = await this.redis.get(key);
      if (!zodString) return null;
      const zodResponse = this.model.zod.safeParse(superjson.parse(zodString));
      if (!zodResponse.success) return null;
      return zodResponse.data as Value<TModel>;
    } catch (e) {
      // console.error('Error in model.get:');
      // console.error(e);
      return null;
    }
  }
}
