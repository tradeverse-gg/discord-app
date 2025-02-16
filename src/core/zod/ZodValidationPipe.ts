import { Injectable, UnprocessableEntityException, type ArgumentMetadata, type PipeTransform } from '@nestjs/common';

import type { ZodDtoStatic } from './createZodDto';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
	public transform(value: unknown, metadata: ArgumentMetadata): unknown {
		const zodSchema = (metadata.metatype as ZodDtoStatic<unknown> | undefined)?.zodSchema;

		if (zodSchema) {
			const parseResult = zodSchema.safeParse(value);

			if (!parseResult.success) {
				const { error } = parseResult;
				const message = error.errors.map((error) => `${error.path.join('.')}: ${error.message}`).join(', ');

				throw new UnprocessableEntityException(`Input validation failed: ${message}`);
			}

			return parseResult.data;
		}

		return value;
	}
}
