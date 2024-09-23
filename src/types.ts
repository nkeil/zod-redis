import { RedisOptions } from 'ioredis';
import { z, ZodTypeAny } from 'zod';

export type SchemaModel = {
  zod: ZodTypeAny;
  getKey: (...args: any[]) => string;
  expirationSeconds?: number;
};
export type Schema = Record<string, SchemaModel>;
type SchemaWithMandatoryExpiration = Record<
  string,
  SchemaModel & Required<Pick<SchemaModel, 'expirationSeconds'>>
>;

export type ModelName<TSchema extends Schema> = keyof TSchema;
export type Key<TModel extends SchemaModel> = ReturnType<TModel['getKey']>;
export type Value<TModel extends SchemaModel> = z.infer<TModel['zod']>;

export type ZRedisOptions = RedisOptions & { schema?: Schema } & (
    | {
        mandatoryExpiration?: false;
      }
    | {
        schema: SchemaWithMandatoryExpiration;
        mandatoryExpiration: true;
      }
  );

export type GetSchema<TOptions extends ZRedisOptions> = TOptions extends {
  schema: infer TSchema;
}
  ? TSchema extends Schema
    ? TSchema
    : Record<string, never>
  : Record<string, never>;
