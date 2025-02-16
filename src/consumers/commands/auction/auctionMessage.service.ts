import { AbstractDefaultMessageCommandConsumer } from '#core/abstract/consumer/message/message.consumer.abstract';
import { DelayedNotificationHandlers } from '#core/types/rmq';
import { MongoAuctionService } from '#mongoose/auction/auction.service';
import { AuctionService } from '#producers/auction.service';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';
import { Injectable } from '@nestjs/common';
import { Embed, Message } from 'discord.js';

@Injectable()
export class AuctionMessageService extends AbstractDefaultMessageCommandConsumer {
	public readonly name = 'auction';
	public readonly aliases = ['auc'];
	public readonly description = 'Create or edit a Tradeverse auction.';
	public readonly enabled = true;

	private activeAuctions: Record<string, number> = {};

	constructor(
		protected override readonly discordProducer: DiscordProducerService,
		private readonly mongoAuctionService: MongoAuctionService,
		private readonly auctionService: AuctionService,
	) {
		super(discordProducer, 'AuctionMessageService');
		void this.loadActiveAuctions();
	}

	public async onMessageExecuted(message: Message): Promise<void> {
		const args = message.content.slice(this.prefix.length).trim().split(/ +/);
		if (args.length < 5) {
			message.reply(`${this.prefix}${this.name} <@bot> <currency> <starting bid> <24h or 12h> <card ID>`);
			return;
		}

		const bot = message.mentions.users.first();
		const [_, __, currency, startingBid, delayType, cardMessageId] = args;

		if (
			!bot ||
			isNaN(Number(startingBid)) ||
			!this.isValidCurrency(bot.id, currency) ||
			!['24h', '12h'].includes(delayType)
		) {
			message.reply('Invalid parameters. Use the correct format. Example: `!auc @bot Wists 100 24h 1234567890`');
			return;
		}

		const scraped = await this.scrape(message, cardMessageId);
		if (!scraped) return;

		const selectedChannel = await this.assignAuctionChannel(delayType);
		if (!selectedChannel) {
			message.reply('All auction slots are full. Try again later.');
			return;
		}

		this.activeAuctions[selectedChannel.id] = (this.activeAuctions[selectedChannel.id] || 0) + 1;
		await this.mongoAuctionService.create({
			auctionId: message.id,
			sellerId: message.author.id,
			channelId: selectedChannel.id,
			cardMessageId,
			cardImage: scraped.imageUrl,
			cardEmbed: scraped.embed.data,
			currency: currency.charAt(0).toUpperCase() + currency.slice(1).toLowerCase(),
			startingBid: Number(startingBid),
			currentBid: Number(startingBid),
			increment: 0,
			status: 'Active',
			startTime: new Date(),
			endTime: new Date(Date.now() + selectedChannel.delay),
		});

		this.auctionService.sendDelayedMessage(
			DelayedNotificationHandlers.AUCTION_DELAYED_NOTIFICATION,
			selectedChannel.delay,
			{ auctionId: message.id, delay: selectedChannel.delay },
		);
		message.reply(`✅ Auction scheduled in <#${selectedChannel.id}> for ${delayType}.`);
	}

	private async scrape(message: Message, cardMessageId: string): Promise<{ imageUrl: string; embed: Embed } | null> {
		try {
			const cardMessage = await message.channel.messages.fetch(cardMessageId);
			if (!cardMessage?.embeds.length) {
				message.reply('⚠️ Invalid card message ID or no embed found.');
				return null;
			}

			const embed = cardMessage.embeds[0];
			const imageUrl = embed.image?.url ?? embed.thumbnail?.url;
			if (!this.isUserCardOwner(embed, message.author.id) || !imageUrl) {
				message.reply('⚠️ You do not own this card or no image found.');
				return null;
			}
			message.reply('✅ Card successfully retrieved!');
			return { imageUrl, embed };
		} catch (error) {
			console.error(error);
			message.reply('❌ Error fetching the message.');
			return null;
		}
	}

	private async loadActiveAuctions(): Promise<void> {
		const activeAuctions = await this.mongoAuctionService.find({ status: 'Active' });
		this.activeAuctions = {};
		for (const auction of activeAuctions) {
			this.activeAuctions[auction.channelId] = (this.activeAuctions[auction.channelId] || 0) + 1;
		}
	}

	private async assignAuctionChannel(delayType: string): Promise<{ id: string; delay: number } | null> {
		const channels = this.auctionChannels.filter((c) =>
			delayType === '24h' ? c.delay === 86400000 : c.delay === 43200000,
		);
		let fallbackChannel: { id: string; delay: number } | null = null;

		for (const channel of channels) {
			const usage = this.activeAuctions[channel.id] || 0;
			if (usage < 5) {
				return { id: channel.id, delay: 0 };
			}
			if (!fallbackChannel) fallbackChannel = { id: channel.id, delay: channel.delay };
		}
		return fallbackChannel;
	}

	private isValidCurrency(botId: string, currency: string): boolean {
		const normalized = currency.charAt(0).toUpperCase() + currency.slice(1).toLowerCase();
		return this.supportedBots.some(
			(b) => b.id === botId && b.currencies.some((c) => new RegExp(`^${c}s?$`, 'i').test(normalized)),
		);
	}

	private isUserCardOwner(embed: Embed, userId: string): boolean {
		const pattern = new RegExp(`<@!?${userId}>`);
		return [embed.title, embed.description, embed.footer?.text, ...embed.fields.map((f) => f.value)].some(
			(txt) => txt && pattern.test(txt),
		);
	}

	public readonly supportedBots = [
		{ name: 'Sofi', id: '853629533855809596', currencies: ['Wists', 'Silvers', 'Gems'] },
		{ name: 'Mazoku', id: '1242388858897956906', currencies: ['Bloodstones', 'Moonstones'] },
	];

	public readonly auctionChannels = [
		{ id: '1340176042215870556', delay: 86400000 }, // 24h
		{ id: '1337208000410161173', delay: 86400000 },
		{ id: '1337208022908272671', delay: 86400000 },
		{ id: '1337208070693982248', delay: 43200000 }, // 12h
		{ id: '1337208090000490527', delay: 43200000 },
		{ id: '1337225645079662602', delay: 43200000 },
	];
}
