/* eslint-disable @typescript-eslint/method-signature-style */
import type { ZodType } from 'zod';

/**
 * ZodType is a very complex interface describing not just public properties but private ones as well
 * causing the interface to change fairly often among versions
 *
 * Since we're interested in the main subset of Zod functionality (type infering + parsing) this type is introduced
 * to achieve the most compatibility.
 */
export interface CompatibleZodIssue {
	message: string;
	path: (number | string)[];
}
export type CompatibleZodType = Pick<ZodType<unknown>, '_input' | '_output'> & {
	parse(...args: unknown[]): unknown;
	safeParse(...args: unknown[]):
		| {
				data: unknown;
				success: true;
		  }
		| {
				error: {
					errors: CompatibleZodIssue[];
					issues: CompatibleZodIssue[];
				};
				success: false;
		  };
};
export type CompatibleZodInfer<T extends CompatibleZodType> = T['_output'];

export interface ZodDtoStatic<T> {
	new (): T;
	create(input: unknown): T;
	zodSchema: CompatibleZodType;
}

export const createZodDto = <T extends CompatibleZodType>(zodSchema: T): ZodDtoStatic<CompatibleZodInfer<T>> => {
	class SchemaHolderClass {
		public static zodSchema = zodSchema;

		public static create(input: unknown): T {
			return this.zodSchema.parse(input) as T;
		}
	}

	return SchemaHolderClass;
};
