import { Schema, type SchemaDefinition, type SchemaDefinitionType, type SchemaOptions } from 'mongoose';

export const createSubSchema = <T>(
	definition: SchemaDefinition<SchemaDefinitionType<T>>,
	options: SchemaOptions = {},
): Schema<T> =>
	new Schema(definition, {
		_id: false,
		versionKey: false,
		...options,
	});
