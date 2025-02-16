/* eslint-disable func-names */
import process from 'node:process';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from 'helmet';

import { ZodValidationPipe } from '#zod';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
	const PORT = process.env.PORT;

	app
		.getHttpAdapter()
		.getInstance()
		.addHook('onRequest', (request: any, reply: any, done: any) => {
			reply.setHeader = function (key: any, value: any) {
				return this.raw.setHeader(key, value);
			};
			reply.end = function () {
				this.raw.end();
			};
			request.res = reply;
			done();
		});
	app.use(helmet());
	app.useGlobalInterceptors();
	app.useGlobalPipes(new ZodValidationPipe());

	await app.listen(PORT ?? 3000, '0.0.0.0');
	Logger.log(`Server is running on http://localhost:${PORT}.`);
}

await bootstrap();
