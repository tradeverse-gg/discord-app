import { Injectable } from '@nestjs/common';
import { type BaseMessageOptions, type ClientEvents, Embed, EmbedBuilder, Events, TextChannel } from 'discord.js';
import { Err, Ok, Result } from 'oxide.ts';
import { Subject, takeUntil } from 'rxjs';

import { AbstractDefaultProducer } from '#core/abstract/producer/default.producer.abstract';
import { type SafeAny } from '#core/types/any';
import { DiscordService } from '#services/discord/discord.service';

export interface DiscordProducerEventType<Event extends keyof ClientEvents> {
	data: [...ClientEvents[Event]];
	event: Event;
}

@Injectable()
export class DiscordProducerService extends AbstractDefaultProducer<
	DiscordProducerEventType<SafeAny>,
	Subject<Result<DiscordProducerEventType<SafeAny>, string>>
> {
	public readonly enabled: boolean = true;
	public readonly emit$ = new Subject<Result<DiscordProducerEventType<SafeAny>, string>>();
	public readonly ready$ = new Subject<Result<DiscordProducerEventType<Events.ClientReady>, string>>();
	public readonly message$ = new Subject<Result<DiscordProducerEventType<Events.MessageCreate>, string>>();
	public readonly interaction$ = new Subject<Result<DiscordProducerEventType<Events.InteractionCreate>, string>>();
	public readonly memberAdd$ = new Subject<Result<DiscordProducerEventType<Events.GuildMemberAdd>, string>>();
	public readonly memberUpdate$ = new Subject<Result<DiscordProducerEventType<Events.GuildMemberUpdate>, string>>();
	public readonly error$ = new Subject<Result<DiscordProducerEventType<Events.Error>, string>>();

	public constructor(public discordService: DiscordService) {
		super('DiscordProducerService');
		this.enabled = true;
	}

	public override onInit(): void {
		this.consoleLogger.log('Initializing Discord producer...');
		this.listenToEvents();
		this.listenToSpecificEvents();
		this.login();
	}

	public async sendMessage({
		channelId,
		content,
		components,
		embed,
	}: {
		channelId: string;
		components?: BaseMessageOptions['components'];
		content: string;
		embed?: EmbedBuilder | Embed;
	}): Promise<void> {
		try {
			const channel = await this.discordService.client.channels.fetch(channelId);
			if (!channel?.isTextBased()) {
				console.warn(`Channel ${channelId} is not text-based.`);
				return;
			}

			await (channel as TextChannel).send({ content, embeds: embed ? [embed] : undefined, components });
		} catch (error) {
			console.error(`Failed to send message to Discord: ${error}`);
		}
	}

	private listenToEvents(): void {
		for (const event of Object.values(Events)) {
			const clientEvent = event as keyof ClientEvents;
			this.discordService.client.on(clientEvent, (...data) => {
				if (clientEvent === Events.Error) {
					const error = data[0];
					const errorMessage =
						error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);

					this.error$.next(Err(errorMessage));
				}

				this.emit$.next(Ok({ event: clientEvent, data }));
			});
		}
	}

	private listenToSpecificEvents(): void {
		this.emit$.pipe(takeUntil(this.destroy$)).subscribe((result) => {
			if (result.isOk()) {
				const event: DiscordProducerEventType<SafeAny> = result.unwrap();
				switch (event.event) {
					case Events.ClientReady:
						this.ready$.next(Ok(event));
						break;
					case Events.MessageCreate:
						this.message$.next(Ok(event));
						break;
					case Events.InteractionCreate:
						this.interaction$.next(Ok(event));
						break;
					case Events.GuildMemberAdd:
						this.memberAdd$.next(Ok(event));
						break;
					case Events.GuildMemberUpdate:
						this.memberUpdate$.next(Ok(event));
						break;
					case Events.Error:
						this.error$.next(Ok(event));
						break;
				}
			}
			this.error$.next(result);
		});
	}

	private login(): void {
		this.consoleLogger.log('Logging in Discord bot...');
		this.discordService
			.login()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (result) => {
					if (result.isOk()) {
						this.consoleLogger.log('Discord login successful');
						this.discordService.registerDiscordInteractions();
						this.discordService.setPresence('online', []);
					} else this.error$.next(Err(result.unwrapErr()));
				},
				error: (error) => {
					this.consoleLogger.error('Login failed:', error);
					this.error$.next(Err(error.message));
				},
			});
	}
}
