import { Result } from 'oxide.ts';
import { takeUntil } from 'rxjs';

import { DiscordProducerService, type DiscordProducerEventType } from '#producers/discord/discord-producer.service';

import { AbstractDefaultConsumer } from '../default.consumer.abstract';

import type { Events, GuildMember } from 'discord.js';

export abstract class AbstractDefaultMemberAddCommandConsumer extends AbstractDefaultConsumer {
	public abstract onMemberAdd(member: GuildMember): void | Promise<void>;

	constructor(
		protected readonly discordProducer: DiscordProducerService,
		protected readonly serviceName: string,
	) {
		super(serviceName);
	}

	public override onModuleInit(): void {
		if (this.enabled) {
			this.discordProducer.memberAdd$
				.pipe(takeUntil(this.destroy$))
				.subscribe((result: Result<DiscordProducerEventType<Events.GuildMemberAdd>, string>) => {
					if (!result.isOk()) {
						this.consoleLogger.error(result.unwrapErr());
						return;
					}

					const [member] = result.unwrap().data;

					try {
						void this.onMemberAdd(member);
					} catch (error) {
						this.consoleLogger.error(`Error in ${this.name} onMessage:`, error);
					}
				});
		}
		super.onModuleInit();
	}
}
