import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { type DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

const logger = new Logger('RabbitMQ');

@Module({})
export class CommonRabbitMQModule {
	static forRootAsync(): DynamicModule {
		return {
			module: CommonRabbitMQModule,
			imports: [
				ConfigModule,
				RabbitMQModule.forRootAsync(RabbitMQModule, {
					imports: [ConfigModule],
					inject: [ConfigService],
					useFactory: (configService: ConfigService) => ({
						exchanges: [
							{
								name: 'delayed_auction',
								type: 'x-delayed-message',
								options: { arguments: { 'x-delayed-type': 'direct' }, durable: true },
								createExchangeIfNotExists: true,
							},
						],
						queues: [
							{
								name: 'delayed_auction',
								options: { durable: true, arguments: { 'x-delayed-type': 'direct' } },
								createQueueIfNotExists: true,
								exchange: 'delayed_auction',
								routingKey: ['delayed-message'],
							},
						],
						uri: configService.getOrThrow('RMQ_URI'),
						connectionInitOptions: { wait: false, reject: true, timeout: 9_000 },
						logger,
						prefetchCount: 1,
					}),
				}),
			],
			exports: [RabbitMQModule],
			providers: [],
			global: true,
		};
	}
}
