import process from 'node:process';

import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { STATES, type Connection } from 'mongoose';

import { ComponentsModule } from '#components/components.module';
import { ConsumersModule } from '#consumers/consumers.module';
import { ProducersModule } from '#producers/producers.module';
import { ServicesModule } from '#services/services.module';

const logger = new Logger('AppModule');

@Module({
	imports: [
		ComponentsModule,
		ConfigModule.forRoot({
			isGlobal: true,
			cache: false,
			envFilePath: '.env',
		}),
		ConsumersModule,
		MongooseModule.forRoot(process.env.DB_URI ?? 'mongodb://localhost:27017/tradeverse', {
			connectionName: 'tradeverse',
			dbName: 'tradeverse',
			connectionFactory: (connection: Connection) => {
				connection.on('connected', () => {
					logger.log('DB connected');
				});
				connection.on('disconnected', () => {
					logger.log('DB disconnected');
				});
				connection.on('error', (error) => {
					logger.log(`DB connection failed! Error: ${error}`);
				});

				logger.log(`DB ${STATES[connection.readyState]}`);
				return connection;
			},
		}),
		ProducersModule,
		ServicesModule,
	],
	providers: [],
})
export class AppModule {}
