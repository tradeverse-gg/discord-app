import { Injectable } from '@nestjs/common';
import { ButtonInteraction, type CacheType } from 'discord.js';

import { AbstractDefaultButtonConsumer } from '#core/abstract/consumer/interaction/button.consumer.abstract';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

import { PingCommandService } from './ping-command.service';
import { PingAction, type PingButtonProps } from './ping.types';

import type { ComponentPayload } from '#components/components.types';

@Injectable()
export class PingButtonService extends AbstractDefaultButtonConsumer {
	public readonly enabled: boolean = true;

	public constructor(
		public override discordProducer: DiscordProducerService,
		public pingCommand: PingCommandService,
	) {
		super(discordProducer, 'PingButtonService', pingCommand.slashCommand.name);
	}

	public async onButtonExecution(
		interaction: ButtonInteraction<CacheType>,
		payload: ComponentPayload<PingButtonProps>,
	): Promise<void> {
		switch (payload.data?.action) {
			case PingAction.Refresh:
				await this.refreshButton(interaction);
				break;
			default:
				await interaction.deferUpdate();
				break;
		}
	}

	private async refreshButton(interaction: ButtonInteraction<CacheType>): Promise<void> {
		await interaction.deferUpdate();

		if (this.pingCommand.isCached) return;

		const content = await this.pingCommand.getContent(interaction);
		await interaction.editReply({ embeds: content.embeds });
	}
}
