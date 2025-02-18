import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
	let app: NestFastifyApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

		await app.init();
		await app.getHttpAdapter().getInstance().ready();
	});

	test('/ (GET)', async () => {
		const result = await app.inject({
			method: 'GET',
			url: '/',
		});
		expect(result.statusCode).toEqual(200);
		expect(result.payload).toEqual('Hello World!');
	});

	afterAll(async () => {
		await app.close();
	});
});
