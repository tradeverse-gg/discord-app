import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app: INestApplication = await NestFactory.create(AppModule);

    await app.listen(process.env.PORT || 3000);
    console.log('Application started on port', process.env.PORT || 3000);
}

bootstrap().catch((err) => {
    console.error('Bootstrap error:', err);
    process.exit(1);
});
