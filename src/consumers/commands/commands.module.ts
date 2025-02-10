import { Module } from '@nestjs/common';
import { PingCommandModule } from './ping/ping-command.module';
import { PingMessageModule } from './ping/ping-message.module';
import { RolesEmbedMessageModule } from './rolesEmbed/rolesEmbed.module';

@Module({
    imports: [PingCommandModule, PingMessageModule, RolesEmbedMessageModule],
    exports: [PingCommandModule, PingMessageModule, RolesEmbedMessageModule],
})
export class CommandsModule {}
