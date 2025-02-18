import { Injectable } from '@nestjs/common';
import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';

import { AbstractDefaultRolesConsumer } from '#core/abstract/consumer/interaction/roles.consumer.';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

import type { ComponentPayload } from '#components/components.types';

@Injectable()
export class RolesInteractionService extends AbstractDefaultRolesConsumer {
	public readonly enabled: boolean = true;

	constructor(protected override readonly discordProducer: DiscordProducerService) {
		super(discordProducer, 'RolesInteractionService', 'roles');
	}

	public async onButtonExecution(interaction: ButtonInteraction, payload: ComponentPayload): Promise<void> {
		await interaction.deferUpdate();
	}

	public override async handleSelfRoles(
		interaction: ButtonInteraction<'cached'> | StringSelectMenuInteraction<'cached'>,
	): Promise<void> {
		await super.handleSelfRoles(interaction);
	}
}
