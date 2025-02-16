import { DiscordServiceModule } from '#services/discord/discord.module';
import { TemplateServiceModule } from '#services/template/template.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [TemplateServiceModule, DiscordServiceModule],
	exports: [TemplateServiceModule, DiscordServiceModule],
})
export class ServicesModule {}
