import { ZodType, z } from "zod";

export type JsonLoader = <T extends ZodType>(
  path: string,
  schema: T
) => Promise<z.infer<T>>;

/** Replace a string property in an object with a computed value. */
export async function populateOn<
  O extends { [P in keyof O]: P extends K ? string : unknown },
  K extends keyof O,
  T
>(
  /** The object to replace properties inside. */
  obj: Promise<O> | O,
  /** The name of the property to replace. */
  key: K,
  /** Function that calculates the replacement value based on the current value. */
  retriever: (path: string) => Promise<T>
): Promise<{ [P in keyof O]: P extends K ? T : O[P] }> {
  // Get the current value of the property.
  const value = (await obj)[key];

  if (typeof value != "string") {
    throw new Error(`Cannot populate ${value}. It was not a string.`);
  }

  // Make a copy of the object.
  const result = { ...obj };

  // Replace the current value with the new computed value.
  (result as any)[key] = (await retriever(value)) as T;

  return result;
}

/** Allows the {@link populateOn} function to be called with chaining. */
export class PopulateBuilder<O extends object> {
  constructor(
    /** The starting value. */
    readonly value: Promise<O> | O
  ) {
    this.value = value;
  }

  /** Replace a property in the object with the result of the passed function. */
  populate<K extends keyof O, T>(
    key: K,
    retriever: (path: string) => Promise<T>
  ) {
    return new PopulateBuilder(populateOn(this.value, key, retriever));
  }

  /** Retrieve the final value. */
  async build(): Promise<O> {
    return await this.value;
  }
}
