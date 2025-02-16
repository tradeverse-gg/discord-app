import { Module } from '@nestjs/common';
import { AuctionModule } from './auction/auction.module';
import { PingCommandModule } from './ping/ping-command.module';
import { PingMessageModule } from './ping/ping-message.module';
import { RolesEmbedMessageModule } from './rolesEmbed/rolesEmbed.module';

@Module({
	imports: [PingCommandModule, PingMessageModule, RolesEmbedMessageModule, AuctionModule],
	exports: [PingCommandModule, PingMessageModule, RolesEmbedMessageModule, AuctionModule],
})
export class CommandsModule {}
