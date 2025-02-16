import { Module } from '@nestjs/common';

import { DiscordService } from '#services/discord/discord.service';

@Module({
	providers: [DiscordService],
	exports: [DiscordService],
})
export class DiscordServiceModule {}
