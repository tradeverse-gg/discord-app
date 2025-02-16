import { AbstractDefaultProducer } from '#core/abstract/producer/default.producer.abstract';
import { SafeAny } from '#core/types/any';
import { DiscordService } from '#services/discord/discord.service';
import { Injectable } from '@nestjs/common';
import { ClientEvents, Events } from 'discord.js';
import { Err, Ok, Result } from 'oxide.ts';
import { Subject, takeUntil } from 'rxjs';

export type DiscordProducerEventType<Event extends keyof ClientEvents> = {
	event: Event;
	data: [...ClientEvents[Event]];
};

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
	public readonly error$ = new Subject<Result<DiscordProducerEventType<Events.Error>, string>>();

	private listenToEvents(): void {
		Object.values(Events).forEach((event) => {
			const clientEvent = event as keyof ClientEvents;
			this.discordService.client.on(clientEvent, (...data) => {
				if (clientEvent === Events.Error) {
					this.error$.next(Err(String(data[0])));
				}
				this.emit$.next(Ok({ event: clientEvent, data }));
			});
		});
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
					} else {
						this.error$.next(Err(result.unwrapErr()));
					}
				},
				error: (error) => {
					this.consoleLogger.error('Login failed:', error);
					this.error$.next(Err(error.message));
				},
			});
	}
	public constructor(public discordService: DiscordService) {
		super('DiscordProducerService');
		this.enabled = true;
	}

	public onInit(): void {
		this.consoleLogger.log('Initializing Discord producer...');
		this.listenToEvents();
		this.listenToSpecificEvents();
		this.login();
	}
}
