import { CommandInteraction, SlashCommandBuilder, type Interaction } from 'discord.js';

import type { DiscordInteraction } from '#services/discord/discord.service';

import { AbstractDefaultInteractionConsumer } from '#core/abstract/consumer/interaction/interaction.consumer.abstract';
import { DiscordRegisterStrategy } from '#core/types/discord-register-strategy';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

interface AbstractDefaultInteractionConsumerInterface extends DiscordInteraction {
	onCommandExecuted: (interaction: CommandInteraction) => void | Promise<void>;
}

export abstract class AbstractDefaultInteractionCommandConsumer
	extends AbstractDefaultInteractionConsumer
	implements AbstractDefaultInteractionConsumerInterface
{
	public abstract readonly registerStrategy: DiscordRegisterStrategy;
	public abstract readonly slashCommand: SlashCommandBuilder;

	public abstract onCommandExecuted(interaction: CommandInteraction): void | Promise<void>;

	public async onInteraction(interaction: Interaction): Promise<void> {
		if (interaction.isCommand() && interaction.commandName === this.slashCommand.name)
			await this.onCommandExecuted(interaction);
	}

	public constructor(
		protected override readonly discordProducer: DiscordProducerService,
		protected override readonly name: string,
	) {
		super(discordProducer, name);
	}

	public override onModuleInit(): void {
		if (this.enabled)
			this.discordProducer.discordService.registerInternalInteraction(this.registerStrategy, this.slashCommand);

		super.onModuleInit();
	}

	public override onModuleDestroy(): void {
		super.onModuleDestroy();
	}
}
