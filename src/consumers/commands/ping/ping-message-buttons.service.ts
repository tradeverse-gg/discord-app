import { Injectable } from '@nestjs/common';
import { ButtonInteraction, type BaseMessageOptions, type CacheType } from 'discord.js';

import { AbstractDefaultButtonConsumer } from '#core/abstract/consumer/interaction/button.consumer.abstract';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

import { PingMessageService } from './ping-message.service';
import { PingAction, type PingButtonProps } from './ping.types';

import type { ComponentPayload } from '#components/components.types';

@Injectable()
export class PingMessageButtonService extends AbstractDefaultButtonConsumer {
	public readonly enabled = true;

	constructor(
		public override readonly discordProducer: DiscordProducerService,
		public readonly pingMessage: PingMessageService,
	) {
		// Match the cmd in the payload
		super(discordProducer, 'pingMessageButtonService', 'ping-message');
	}

	private async refreshButton(interaction: ButtonInteraction<CacheType>) {
		await interaction.deferUpdate();

		if (this.pingMessage.isCached) return;

		const content: BaseMessageOptions = await this.pingMessage.getContent(interaction.message);
		await interaction.message.edit(content);
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
}
