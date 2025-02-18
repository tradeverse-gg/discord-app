/* eslint-disable no-console */
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

import { Delayed_Auction_Queue_Exchange, DelayedNotificationHandlers } from '#core/types/rmq';
import { MongoAuctionService } from '#mongoose/auction/auction.service';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

@Injectable()
export class AuctionQueueConsumer {
	private readonly handlerMap:
		| Record<string, (args: { data?: any; handlerToken: string; message?: string }) => Promise<void>>
		| Record<string, undefined> = {};

	constructor(
		private readonly mongoAuctionService: MongoAuctionService,
		private readonly discordProducer: DiscordProducerService,
	) {
		this.initializeHandlers();
	}

	@RabbitSubscribe({
		exchange: Delayed_Auction_Queue_Exchange,
		queue: Delayed_Auction_Queue_Exchange,
		routingKey: 'delayed-message',
		queueOptions: { arguments: { 'x-delayed-type': 'direct' }, bindQueueArguments: { 'x-delayed-type': 'direct' } },
	})
	public async handleDelayedMessage(rawMessage: string) {
		try {
			console.log('AuctionQueueConsumer.handleDelayedMessage', rawMessage);
			const parsedMessage = JSON.parse(rawMessage) as { data?: any; handlerToken: string; message?: string };
			const { handlerToken, data } = parsedMessage;

			const handler = this.handlerMap[handlerToken];
			if (handler) await handler(data);
			else console.log(`No handler found for ${handlerToken}`);
		} catch (error) {
			console.error('AuctionQueueConsumer.handleDelayedMessage', error);
		}
	}

	private async handleAuction(data: { auctionId: string; delay: number }) {
		const auction = await this.mongoAuctionService.findOne({ auctionId: data.auctionId });
		if (!auction) {
			console.log(`Auction not found: ${data.auctionId}`);
			return;
		}

		const auctionEmbed = new EmbedBuilder()
			.setTitle(`📌 Auction ID: ${auction.auctionId}`)
			.setDescription(
				`**💰 Current Bid:** ${auction.currentBid} ${auction.currency}\n` +
					`**📈 Increment per bid:** ${auction.increment} ${auction.currency}\n` +
					`**🔢 Bids done:** ${auction.bidders ? auction.bidders.length : 0}\n\n` +
					`**⏳ Ends in:** <t:${Math.floor(auction.endTime.getTime() / 1_000)}:R>\n\n` +
					`**👤 Seller:** <@${auction.sellerId}>\n\n` +
					// { text: `${auction.cardEmbed.title ?? ''} - ${auction.cardEmbed.description ?? ''}` }
					`🃏\n${auction.cardEmbed.title ? auction.cardEmbed.title + '\n' : ''} - ${auction.cardEmbed.description ? auction.cardEmbed.description + '\n' : ''}`,
			)
			.setImage(auction.cardImage)
			.setFooter({ text: 'Tradeverse Auctions' })
			.setColor('#ff4081');

		const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId(`bid_${auction.auctionId}`).setLabel('Bid').setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId(`accept_${auction.auctionId}`).setLabel('Accept').setStyle(ButtonStyle.Success),
			new ButtonBuilder().setCustomId(`pause_${auction.auctionId}`).setLabel('Pause').setStyle(ButtonStyle.Danger),
		);

		await this.discordProducer.sendMessage({
			channelId: auction.channelId,
			content: '🎉 **New Auction Started!** 🎉',
			embed: auctionEmbed,
			components: [buttons],
		});
	}

	private initializeHandlers() {
		this.handlerMap[DelayedNotificationHandlers.AUCTION_DELAYED_NOTIFICATION] = this.handleAuction.bind(this);
	}
}
