type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <
  V,
>() => V extends U ? 1 : 2
  ? true
  : false;

export type isAny<T> = 0 extends 1 & T ? true : false;
export const assertEqual = <A, B>(val: AssertEqual<A, B>) => val;
export const assertIs = <T>(_arg: T): void => {};
export function assertNever(_x: never): never {
  throw new Error();
}
