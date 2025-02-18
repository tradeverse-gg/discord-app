import { ButtonInteraction, type Interaction } from 'discord.js';

import { AbstractDefaultInteractionConsumer } from '#core/abstract/consumer/interaction/interaction.consumer.abstract';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

import type { ComponentPayload } from '#components/components.types';

export interface AbstractDefaultButtonConsumerInterface {
	onButtonExecution: (interaction: ButtonInteraction, payload: ComponentPayload) => void | Promise<void>;
	slashCommandName: string;
}

export abstract class AbstractDefaultButtonConsumer
	extends AbstractDefaultInteractionConsumer
	implements AbstractDefaultButtonConsumerInterface
{
	public constructor(
		protected override readonly discordProducer: DiscordProducerService,
		protected override readonly name: string,
		public readonly slashCommandName: string,
	) {
		super(discordProducer, name);
	}

	public abstract onButtonExecution(interaction: ButtonInteraction, payload: ComponentPayload): void | Promise<void>;

	public async onInteraction(interaction: Interaction): Promise<void> {
		if (interaction.isButton() && interaction.customId) {
			try {
				const payload: ComponentPayload = JSON.parse(interaction.customId);

				if (payload.cmd === this.slashCommandName) await this.onButtonExecution(interaction, payload);
			} catch (error) {
				this.consoleLogger.error(`Error in ${this.name} onInteraction:`, error);
			}
		}
	}
}
