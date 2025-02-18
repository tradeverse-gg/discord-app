import { Module } from '@nestjs/common';

import { DiscordServiceModule } from '#services/discord/discord.module';

@Module({
	imports: [DiscordServiceModule],
	exports: [DiscordServiceModule],
})
export class ServicesModule {}
