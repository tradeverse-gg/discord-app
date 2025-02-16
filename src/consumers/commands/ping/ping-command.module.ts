import { ComponentsModule } from '#components/components.module';
import { DiscordProducerModule } from '#producers/discord/discord-producer.module';
import { Module } from '@nestjs/common';
import { PingButtonService } from './ping-buttons.service';
import { PingCommandService } from './ping-command.service';

@Module({
	imports: [ComponentsModule, DiscordProducerModule],
	providers: [PingCommandService, PingButtonService],
	exports: [PingCommandService, PingButtonService],
})
export class PingCommandModule {}
