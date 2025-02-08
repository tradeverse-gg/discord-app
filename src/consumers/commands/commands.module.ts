import { Module } from '@nestjs/common';
import { PingCommandModule } from './ping/ping-command.module';
import { PingMessageModule } from './ping/ping-message.module';

@Module({
    imports: [PingCommandModule, PingMessageModule],
    exports: [PingCommandModule, PingMessageModule],
})
export class CommandsModule {}
