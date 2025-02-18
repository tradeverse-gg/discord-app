import { Events, type Interaction } from 'discord.js';
import { Result } from 'oxide.ts';
import { takeUntil } from 'rxjs';

import { AbstractDefaultConsumer } from '#core/abstract/consumer/default.consumer.abstract';
import { DiscordProducerService, type DiscordProducerEventType } from '#producers/discord/discord-producer.service';

interface AbstractDefaultInteractionConsumerInterface {
	onInteraction: (Interaction: Interaction) => void;
}

export abstract class AbstractDefaultInteractionConsumer
	extends AbstractDefaultConsumer
	implements AbstractDefaultInteractionConsumerInterface
{
	public abstract onInteraction(Interaction: Interaction): void | Promise<void>;

	constructor(
		protected readonly discordProducer: DiscordProducerService,
		protected override readonly name: string,
	) {
		super(name);
	}

	public override onModuleInit(): void {
		if (this.enabled) {
			this.discordProducer.interaction$
				.pipe(takeUntil(this.destroy$))
				.subscribe(async (result: Result<DiscordProducerEventType<Events.InteractionCreate>, string>) => {
					if (!result.isOk()) this.consoleLogger.error(result.unwrapErr);

					try {
						await this.onInteraction(...result.unwrap().data);
					} catch (error) {
						await this.handleFatalError(...result.unwrap().data, error);
					}
				});
		}
		super.onModuleInit();
	}

	public async handleFatalError(interaction: Interaction, error: any): Promise<void> {
		this.consoleLogger.error(`Fatal error occurred in ${this.name}: ${error}`);
		const message = `Fatal error occurred in ${this.name}. Please contact the developer.`;

		switch (true) {
			case interaction.isChatInputCommand() || interaction.isMessageComponent():
				if (interaction.deferred) {
					await interaction.deleteReply();
					await interaction.followUp(message);
					break;
				}
				if (!interaction.replied) {
					await interaction.reply(message);
					break;
				}
				await interaction.editReply(message);
		}
	}
}
