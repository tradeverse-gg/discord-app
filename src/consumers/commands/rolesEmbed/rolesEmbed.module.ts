import { DiscordProducerModule } from '@/producers/discord/disocrd-producer.module';
import { RolesInteractionService } from '@/services/discord/selfRoles.module';
import { Module } from '@nestjs/common';
import { RolesEmbedMessageService } from './rolesEmbedMessage.service';

@Module({
    imports: [DiscordProducerModule],
    providers: [RolesEmbedMessageService, RolesInteractionService],
    exports: [RolesEmbedMessageService, RolesInteractionService],
})
export class RolesEmbedMessageModule {}
