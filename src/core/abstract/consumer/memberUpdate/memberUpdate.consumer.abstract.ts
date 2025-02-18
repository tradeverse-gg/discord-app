import { Result } from 'oxide.ts';
import { takeUntil } from 'rxjs';

import { DiscordProducerService, type DiscordProducerEventType } from '#producers/discord/discord-producer.service';

import { AbstractDefaultConsumer } from '../default.consumer.abstract';

import type { Events, GuildMember, PartialGuildMember } from 'discord.js';

export abstract class AbstractDefaultMemberUpdateCommandConsumer extends AbstractDefaultConsumer {
	public abstract onMemberUpdate(
		oldMember: GuildMember | PartialGuildMember,
		newMember: GuildMember,
	): void | Promise<void>;

	constructor(
		protected readonly discordProducer: DiscordProducerService,
		protected readonly serviceName: string,
	) {
		super(serviceName);
	}

	public override onModuleInit(): void {
		if (this.enabled) {
			this.discordProducer.memberUpdate$
				.pipe(takeUntil(this.destroy$))
				.subscribe((result: Result<DiscordProducerEventType<Events.GuildMemberUpdate>, string>) => {
					if (!result.isOk()) {
						this.consoleLogger.error(result.unwrapErr());
						return;
					}

					const [oldMember, newMember] = result.unwrap().data;

					try {
						void this.onMemberUpdate(oldMember, newMember);
					} catch (error) {
						this.consoleLogger.error(`Error in ${this.name} onMemberUpdate:`, error);
					}
				});
		}
		super.onModuleInit();
	}
}
