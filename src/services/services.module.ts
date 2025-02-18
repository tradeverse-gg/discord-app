import { Module } from '@nestjs/common';

import { DiscordServiceModule } from '#services/discord/discord.module';
import { TemplateServiceModule } from '#services/template/template.module';

@Module({
	imports: [DiscordServiceModule, TemplateServiceModule],
	exports: [DiscordServiceModule, TemplateServiceModule],
})
export class ServicesModule {}
