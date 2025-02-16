import { execSync } from 'node:child_process';
import { opendir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

import { jsonSchemaToZod, type JsonSchema } from 'json-schema-to-zod';
import mongoose from 'mongoose';
// @ts-expect-error -- mongoose-schema-jsonschema does not have types
import mongooseFn from 'mongoose-schema-jsonschema';

mongooseFn(mongoose);

const flags = process.argv.slice(2);
let runEsLint = false;
if (flags.includes('--eslint')) runEsLint = true;

async function* findFilesRecursively(path: string): AsyncGenerator<string> {
	try {
		const dir = await opendir(path);
		for await (const item of dir) {
			if (item.isFile()) yield join(dir.path, item.name);
			else if (item.isDirectory()) yield* findFilesRecursively(join(dir.path, item.name));
		}
	} catch (error: any) {
		if (error.code !== 'ENOENT') console.error(error);
	}
}

let exportMap = '';
const startTime = performance.now();
let processedFiles = 0;
let totalSchemas = 0;

console.info('🚀 Starting Schema Conversion Process\n');
console.info('📁 Scanning directories for schema files...\n');

for await (const file of findFilesRecursively('./src/core/mongo/schemas')) {
	processedFiles++;
	const fileName = file.split('/').pop();
	console.info(`\n📄 Processing: ${fileName}`);
	console.info('├── 🔍 Loading schema...');

	const schemaImport = (await import(file)) as {
		[key: string]: { jsonSchema: () => JsonSchema };
	};

	const schemaKeys = Object.keys(schemaImport).filter((key) => key.endsWith('Schema'));
	if (!schemaKeys.length) {
		console.info('    └── No schemas found in this file, skipping...');
		continue;
	}

	console.info(`├── ✨ Found schemas: ${schemaKeys.join(', ')}`);
	const sanitizedPath = file.replaceAll('\\', '/');
	const pathToWrite = sanitizedPath.replace('schemas', 'zod').replace('.schema.', '.dto.');
	console.info(`├── 💾 Writing files:`);
	console.info(`│   ├── 📝 ${pathToWrite}`);

	let dtoFileContent = `
    /* THIS FILE WAS GENERATED AUTOMATICALLY BY Tradeverse CRM BACKEND. */
    /* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
    /* TO REGENERATE RUN: \`yarn sync\` FROM THE mongo PACKAGE */

    import { z, type TypeOf } from 'zod';
    `;

	await Promise.all(
		// eslint-disable-next-line @typescript-eslint/no-loop-func
		schemaKeys.map(async (schemaName) => {
			const zodSchemaName = schemaName.replace('Schema', 'ZodSchema');
			const Schema = schemaImport[schemaName];

			const customZodTypes = schemaImport[`custom${schemaName}ZodTypes`] as unknown;
			console.info(`│       - Converting ${schemaName} to JSON schema...`);
			const jsonSchemaObject = Schema.jsonSchema();

			console.info(`│       - Generating zod schema ${zodSchemaName}...`);

			const code = jsonSchemaToZod(jsonSchemaObject, {
				module: 'none',
				name: zodSchemaName,
				depth: 15,
				anyTypeCustomCode: customZodTypes as Record<string, string>,
			});

			const partialCode = `export const Partial${zodSchemaName} = ${zodSchemaName}.partial()`;

			dtoFileContent += `
            export ${code}
            ${partialCode}

            export type I${zodSchemaName} = TypeOf<typeof ${zodSchemaName}>;
            export type IPartial${zodSchemaName} = TypeOf<typeof Partial${zodSchemaName}>;
            `;

			const fileBaseName = sanitizedPath.split('/').pop()!;
			const schemaNameTrimmed = schemaName.replace('Schema', '');
			const schemaVarName = schemaNameTrimmed.charAt(0).toLowerCase() + schemaNameTrimmed.slice(1).replace('-', '');
			const partialVarName = schemaVarName.charAt(0).toUpperCase() + schemaVarName.slice(1);

			const separateTestFilePath = pathToWrite.replace('.dto.', `.${schemaVarName}.test.`);
			console.info(`│       └── 🧪 Creating test file for ${schemaName}: ${separateTestFilePath}`);

			const testFileContent = `
            /* THIS FILE WAS GENERATED AUTOMATICALLY BY Tradeverse CRM BACKEND. */
            /* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
            /* TO REGENERATE RUN: \`yarn sync\` FROM THE mongo PACKAGE */

            import { assertType } from 'vitest';
            import type { CompatibleType } from '../MongooseCompatibleType';
            import type { I${zodSchemaName}, IPartial${zodSchemaName} } from './${fileBaseName.replace('.schema.', '.dto.')}';
            import type { I${schemaNameTrimmed} } from '../schemas/${fileBaseName}';

            type Compatible${schemaNameTrimmed} = CompatibleType<I${schemaNameTrimmed}>;
            type PartialCompatible${schemaNameTrimmed} = Partial<Compatible${schemaNameTrimmed}>;

            declare const ${schemaVarName}: Compatible${schemaNameTrimmed};
            declare const ${schemaVarName}Dto: I${zodSchemaName};
            declare const partial${partialVarName}: PartialCompatible${schemaNameTrimmed};
            declare const partial${partialVarName}Dto: IPartial${zodSchemaName};

            describe('${schemaNameTrimmed}Dto', () => {
            test('It should match the mongodb ${schemaName} type', () => {
                assertType<I${zodSchemaName}>(${schemaVarName});
            });

            test('It should match the zod ${zodSchemaName} type', () => {
                assertType<Compatible${schemaNameTrimmed}>(${schemaVarName}Dto);
            });

            test('It should match the mongodb Partial${schemaName} type', () => {
                assertType<IPartial${zodSchemaName}>(partial${partialVarName});
            });

            test('It should match the zod Partial${zodSchemaName} type', () => {
                assertType<PartialCompatible${schemaNameTrimmed}>(partial${partialVarName}Dto);
            });
            });
            `;

			await writeFile(separateTestFilePath, testFileContent);

			totalSchemas++;
			exportMap += `export { ${zodSchemaName}, type I${zodSchemaName}, Partial${zodSchemaName}, type IPartial${zodSchemaName} } from './${pathToWrite
				.split('/')
				.pop()!
				.replace('.ts', '.js')}';\n`;
		}),
	);

	await writeFile(pathToWrite, dtoFileContent);
}

console.info('\n📦 Finalizing...');
console.info('├── 📝 Writing index file...');
await writeFile('./src/core/mongo/zod/index.ts', exportMap);

console.info('├── 🧪 Running Eslint...');
if (runEsLint) execSync(`yarn eslint --fix ./src/core/mongo/`);
else console.info('│   └── Skipping Eslint...');
console.info('└── 🎨 Running prettier...');
execSync(`yarn prettier --write ./src/core/mongo/`);

const duration = ((performance.now() - startTime) / 1_000).toFixed(2);
console.info(`\n✨ Conversion Complete! (${duration}s)`);
console.info(`📊 Summary:`);
console.info(`   • Files processed: ${processedFiles}`);
console.info(`   • Schemas converted: ${totalSchemas}`);
