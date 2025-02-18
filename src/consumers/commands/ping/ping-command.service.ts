import { ActionRowBuilder, ButtonBuilder, RestOrArray } from '@discordjs/builders';
import { Injectable } from '@nestjs/common';
import {
	APIEmbedField,
	BaseInteraction,
	BaseMessageOptions,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	Message,
	SlashCommandBuilder,
} from 'discord.js';

import { ButtonsComponentsProps, ButtonsComponentsService } from '#components/buttons/buttons-component.service';
import { ComponentPayload } from '#components/components.types';
import { EmbedComponentType, EmbedsComponentsService } from '#components/embeds/embeds-component.service';
import { PingAction, PingButtonProps } from '#consumers/commands/ping/ping.types';
import { AbstractDefaultInteractionCommandConsumer } from '#core/abstract/consumer/interaction/command.consumer.abstract';
import { DiscordRegisterStrategy } from '#core/types/discord-register-strategy';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

interface PingableSystem {
	computePing: (interaction: BaseInteraction) => Promise<number> | number;
	emoji: (interaction?: BaseInteraction) => string | Promise<string>;
	isAvailable: boolean;
	name: string;
	ping: number;
}

@Injectable()
export class PingCommandService extends AbstractDefaultInteractionCommandConsumer {
	public readonly name: string = 'ping';
	public readonly enabled: boolean = true;
	public readonly registerStrategy: DiscordRegisterStrategy.GLOBAL = DiscordRegisterStrategy.GLOBAL;
	public readonly slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
		.setName('ping')
		.setDescription("Check the bot's latency");

	public readonly systems: PingableSystem[] = [];
	private maxCacheTime: number = 1_000 * 60 * 5; //
	private lasstCacheTime: number = 0;

	get isCached(): boolean {
		const now = Date.now();
		const isCached = now - this.lasstCacheTime < this.maxCacheTime;
		if (!isCached) 
			return true;
		
		return false;
	}

	public async getContent(interaction: BaseInteraction): Promise<BaseMessageOptions> {
		const buttons: ActionRowBuilder<ButtonBuilder> = await this.computeButtons(interaction);

		try {
			await this.computePings(interaction);
			const isAllSystemsAvailable = this.systems.every((system) => system.isAvailable);

			const fields: RestOrArray<APIEmbedField> = [];

			for (const system of this.systems) {
				const emoji: string = await system.emoji(interaction);

				fields.push({
					name: system.isAvailable ? `${emoji} ${system.name} Latency` : `:warning: ${system.name}`,
					value: system.isAvailable ? `\`${system.ping}ms\`` : 'Unavailable',
					inline: true,
				});
			}

			const embed: EmbedBuilder = this.embeds.embed({
				type: isAllSystemsAvailable ? EmbedComponentType.Default : EmbedComponentType.Error,
				description: isAllSystemsAvailable ? 'All systems are available.' : 'Some systems are not available.',
				fields,
			});

			return { embeds: [embed], components: [buttons] };
		} catch (error) {
			if (this.isDevelopment) 
				this.consoleLogger.error(error);
			
			return {
				embeds: [this.embeds.embed({ type: EmbedComponentType.Error })],
				components: [buttons],
			};
		}
	}

	private async computeButtons(interaction: BaseInteraction): Promise<ActionRowBuilder<ButtonBuilder>> {
		let deletable = false;

		if (interaction.isCommand()) {
			const reply: Message = await interaction.fetchReply();
			deletable = reply.deletable;
		}

		if (interaction.isButton()) 
			 
			deletable = interaction.message.deletable;
		

		const buttons: ButtonsComponentsProps<ComponentPayload<PingButtonProps>>[] = [
			{
				label: 'Refresh',
				style: ButtonStyle.Primary,
				disabled: false,
				payload: {
					cmd: this.slashCommand.name,
					data: {
						action: PingAction.Refresh,
						updatedAt: Date.now(),
					},
				},
				emoji: { name: '🔄' },
			},
		];

		return this.buttons.buttonRow(buttons);
	}

	private async computePings(interaction: BaseInteraction): Promise<void> {
		if (this.isCached) 
			return;
		

		await Promise.all(
			this.systems.map(async (system) => {
				system.ping = await system.computePing(interaction);
				system.isAvailable = system.ping !== -1;
			}),
		);

		this.lasstCacheTime = Date.now();
	}

	private createDiscordSystem() {
		this.systems.push({
			name: 'Discord',
			emoji: async () => '💬',
			isAvailable: true,
			ping: 0,
			computePing: async (interaction) => {
				const now: Date = new Date();
				const interactionTime: number = interaction.createdTimestamp;
				return now.getTime() - interactionTime;
			},
		});
	}

	private createSystems(): void {
		this.createDiscordSystem();
		// this.createBackendSystem();
	}

	constructor(
		public discordProducer: DiscordProducerService,
		public embeds: EmbedsComponentsService,
		public buttons: ButtonsComponentsService,
	) {
		super(discordProducer, 'PingCommandService');
	}

	public async onCommandExecuted(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply();
		const content = await this.getContent(interaction);
		await interaction.editReply(content);
	}

	public async onInit(): Promise<void> {
		this.createSystems();
	}
}
