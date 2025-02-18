import { Module } from '@nestjs/common';

import { ComponentsModule } from '#components/components.module';
import { DiscordProducerModule } from '#producers/discord/discord-producer.module';

import { PingButtonService } from './ping-buttons.service';
import { PingCommandService } from './ping-command.service';

@Module({
	imports: [ComponentsModule, DiscordProducerModule],
	providers: [PingButtonService, PingCommandService],
	exports: [PingButtonService, PingCommandService],
})
export class PingCommandModule {}
