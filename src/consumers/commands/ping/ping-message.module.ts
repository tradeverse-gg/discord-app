import { ComponentsModule } from '@/components/components.module';
import { DiscordProducerModule } from '@/producers/discord/disocrd-producer.module';
import { Module } from '@nestjs/common';

import { PingMessageButtonService } from './ping-message-buttons.service';
import { PingMessageService } from './ping-message.service';

@Module({
    imports: [ComponentsModule, DiscordProducerModule],
    providers: [PingMessageService, PingMessageButtonService],
    exports: [PingMessageService, PingMessageButtonService],
})
export class PingMessageModule {}
