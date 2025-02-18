import { Module } from '@nestjs/common';

import { DiscordProducerModule } from '#producers/discord/discord-producer.module';
import { RolesInteractionService } from '#services/discord/selfRoles.module';

import { RolesEmbedMessageService } from './rolesEmbedMessage.service';

@Module({
	imports: [DiscordProducerModule],
	providers: [RolesEmbedMessageService, RolesInteractionService],
	exports: [RolesEmbedMessageService, RolesInteractionService],
})
export class RolesEmbedMessageModule {}
