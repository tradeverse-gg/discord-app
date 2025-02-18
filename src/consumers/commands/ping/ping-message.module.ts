import { Module } from '@nestjs/common';

import { ComponentsModule } from '#components/components.module';
import { DiscordProducerModule } from '#producers/discord/discord-producer.module';

import { PingMessageButtonService } from './ping-message-buttons.service';
import { PingMessageService } from './ping-message.service';

@Module({
	imports: [ComponentsModule, DiscordProducerModule],
	providers: [PingMessageButtonService, PingMessageService],
	exports: [PingMessageButtonService, PingMessageService],
})
export class PingMessageModule {}
