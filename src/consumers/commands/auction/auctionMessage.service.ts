import { Injectable } from '@nestjs/common';
import { Embed, Message } from 'discord.js';

import { AbstractDefaultMessageCommandConsumer } from '#core/abstract/consumer/message/message.consumer.abstract';
import { DelayedNotificationHandlers } from '#core/types/rmq';
import { MongoAuctionService } from '#mongoose/auction/auction.service';
import { AuctionService } from '#producers/auction.service';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

@Injectable()
export class AuctionMessageService extends AbstractDefaultMessageCommandConsumer {
	public readonly name = 'auction';
	public readonly aliases = ['auc'];
	public readonly description = 'Create or edit a Tradeverse auction.';
	public readonly enabled = true;
	public readonly supportedBots = [
		{ name: 'Sofi', id: '853629533855809596', currencies: ['Wists', 'Silvers', 'Gems'] },
		{ name: 'Mazoku', id: '1242388858897956906', currencies: ['Bloodstones', 'Moonstones'] },
	];

	public readonly auctionChannels = [
		{ id: '1340176042215870556', delay: 86_400_000 }, // 24h
		{ id: '1337208000410161173', delay: 86_400_000 },
		{ id: '1337208022908272671', delay: 86_400_000 },
		{ id: '1337208070693982248', delay: 43_200_000 }, // 12h
		{ id: '1337208090000490527', delay: 43_200_000 },
		{ id: '1337225645079662602', delay: 43_200_000 },
	];

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
		if (message.channel.id !== '1340579429943873587') {
			await message.reply(
				'❌ This command can only be used in the https://discord.com/channels/1250543265686622248/1340579429943873587 channel.',
			);
			return;
		}
		const args = message.content.slice(this.prefix.length).trim().split(/ +/);
		if (args.length < 5) {
			await message.reply(`${this.prefix}${this.name} <@bot> <currency> <starting bid> <24h or 12h> <card ID>`);
			return;
		}

		const bot = message.mentions.users.first();
		if (!this.supportedBots.some((b) => b.id === bot?.id)) {
			await message.reply(`Unsupported bot. Supported bots: ${this.supportedBots.map((b) => b.name).join(', ')}`);
			return;
		}
		const [_, __, currency, startingBid, delayType, cardMessageId] = args;

		if (
			!bot ||
			Number.isNaN(Number(startingBid)) ||
			!this.isValidCurrency(bot.id, currency) ||
			!['24h', '12h'].includes(delayType)
		) {
			await message.reply(
				'Invalid parameters. Use the correct format. Example: `!auc <@bot> <currency> <starting bid> <24h or 12h> <card ID>`',
			);
			return;
		}

		const scraped = await this.scrape(message, cardMessageId, bot.id);
		if (!scraped) return;

		const selectedChannel = await this.assignAuctionChannel(delayType);
		if (!selectedChannel) {
			await message.reply('All auction slots are full. Try again later.');
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
			bidders: [],
		});

		void this.auctionService.sendDelayedMessage(DelayedNotificationHandlers.AUCTION_DELAYED_NOTIFICATION, 50_000, {
			auctionId: message.id,
			delay: 50_000,
		});
		// When the message will be sent (live time)
		const liveTime = selectedChannel.delay ? new Date(Date.now() + selectedChannel.delay) : new Date();
		const auctionEndTime = new Date(liveTime.getTime() + (delayType === '24h' ? 86_400_000 : 43_200_000)); // 24h or 12h

		const liveTimestamp = Math.floor(liveTime.getTime() / 1_000);
		const endTimestamp = Math.floor(auctionEndTime.getTime() / 1_000);

		const liveTimeText = selectedChannel.delay
			? `Will be live in <t:${liveTimestamp}:R>` // If there's a delay
			: 'Auction is live now!'; // No delay, should be live instantly

		await message.reply(
			`✅ Auction scheduled in <#${selectedChannel.id}> for ${delayType}. ${liveTimeText} \n ⏳ Ends: <t:${endTimestamp}:R>`,
		);
	}

	private async scrape(
		message: Message,
		cardMessageId: string,
		botId: string,
	): Promise<{ embed: Embed; imageUrl: string } | null> {
		try {
			const cardMessage = await message.channel.messages.fetch(cardMessageId);
			if (!cardMessage.embeds.length) {
				await message.reply('⚠️ Invalid card message ID or no embed found.');
				return null;
			}

			if (cardMessage.author.id !== botId) {
				await message.reply('⚠️ The card message must be from the bot you are trying to auction.');
				return null;
			}

			const embed = cardMessage.embeds[0];
			const imageUrl = embed.image?.url ?? embed.thumbnail?.url;
			if (!this.isUserCardOwner(embed, message.author.id) || !imageUrl) {
				await message.reply('⚠️ You do not own this card or no image found.');
				return null;
			}
			await message.reply('✅ Card successfully retrieved!');
			return { imageUrl, embed };
		} catch (error) {
			console.error(error);
			await message.reply('❌ Error fetching the message.');
			return null;
		}
	}

	private async loadActiveAuctions(): Promise<void> {
		const activeAuctions = await this.mongoAuctionService.find({ status: 'Active' });
		this.activeAuctions = {};
		for (const auction of activeAuctions)
			this.activeAuctions[auction.channelId] = (this.activeAuctions[auction.channelId] || 0) + 1;
	}

	private async assignAuctionChannel(delayType: string): Promise<{ delay: number; id: string } | null> {
		const channels = this.auctionChannels.filter((ch) =>
			delayType === '24h' ? ch.delay === 86_400_000 : ch.delay === 43_200_000,
		);

		// Max auctions per channel before queueing starts
		const maxAuctionsPerChannel = 5;

		let fallbackChannel: { delay: number; id: string } | null = null;

		for (const channel of channels) {
			const usage = this.activeAuctions[channel.id] || 0;

			// If any channel has less than 15 active auctions, start immediately
			if (usage < maxAuctionsPerChannel) {
				this.activeAuctions[channel.id] = usage + 1; // Track active auctions
				return { id: channel.id, delay: 0 };
			}

			// Store the fallback channel for queueing (next batch of 15)
			if (!fallbackChannel || this.activeAuctions[fallbackChannel.id] > usage)
				fallbackChannel = { id: channel.id, delay: channel.delay };
		}

		if (fallbackChannel) this.activeAuctions[fallbackChannel.id] = (this.activeAuctions[fallbackChannel.id] || 0) + 1;

		return fallbackChannel;
	}

	private isValidCurrency(botId: string, currency: string): boolean {
		const normalized = currency.charAt(0).toUpperCase() + currency.slice(1).toLowerCase();
		return this.supportedBots.some(
			(b) => b.id === botId && b.currencies.some((cu) => new RegExp(`^${cu}s?$`, 'i').test(normalized)),
		);
	}

	private isUserCardOwner(embed: Embed, userId: string): boolean {
		const pattern = new RegExp(`<@!?${userId}>`);
		return [embed.title, embed.description, embed.footer?.text, ...embed.fields.map((fi) => fi.value)].some(
			(txt) => txt && pattern.test(txt),
		);
	}
}
