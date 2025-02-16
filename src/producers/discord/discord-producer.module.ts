import { Module } from '@nestjs/common';

import { DiscordProducerService } from '#producers/discord/discord-producer.service';
import { DiscordServiceModule } from '#services/discord/discord.module';

@Module({
	imports: [DiscordServiceModule],
	providers: [DiscordProducerService],
	exports: [DiscordProducerService],
})
export class DiscordProducerModule {}
