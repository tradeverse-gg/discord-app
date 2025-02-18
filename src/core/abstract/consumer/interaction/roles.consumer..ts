import { ButtonInteraction, Interaction, StringSelectMenuInteraction } from 'discord.js';

import { ComponentPayload } from '#components/components.types';
import { AbstractDefaultInteractionConsumer } from '#core/abstract/consumer/interaction/interaction.consumer.abstract';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

export interface AbstractDefaultRolesConsumerInterface {
	onButtonExecution: (interaction: ButtonInteraction, payload: ComponentPayload) => void | Promise<void>;
	slashCommandName: string;
}

export abstract class AbstractDefaultRolesConsumer
	extends AbstractDefaultInteractionConsumer
	implements AbstractDefaultRolesConsumerInterface
{
	public abstract onButtonExecution(interaction: ButtonInteraction, payload: ComponentPayload): void | Promise<void>;

	public async onInteraction(interaction: Interaction<'cached'>): Promise<void> {
		if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('selfRoles-'))
			return this.handleSelfRoles(interaction);
	}

	constructor(
		protected readonly discordProducer: DiscordProducerService,
		protected readonly name: string,
		public readonly slashCommandName: string,
	) {
		super(discordProducer, name);
	}

	public onModuleInit(): void {
		super.onModuleInit();
	}

	public onModuleDestroy(): void {
		super.onModuleDestroy();
	}

	public async handleSelfRoles(
		interaction: ButtonInteraction<'cached'> | StringSelectMenuInteraction<'cached'>,
	): Promise<void> {
		if (!interaction) {
			this.consoleLogger.log('Interaction not found!');
			return;
		}

		const rolesMap = new Map([
			// Regions
			['Asia', '1338363578184372306'],
			['Africa', '1338363779632599103'],
			['North America', '1338363641023434793'],
			['South America', '1338363676792455189'],
			['Europe', '1338363761135714344'],
			['Oceania', '1338363699768983562'],
			// Games
			['Sofi Player', '1338364763364786257'],
			['Mazoku Player', '1338364804359786569'],
			['Miyori Player', '1338364828170846291'],
			['Shoob Player', '1338364853429211278'],
			['Tofu Player', '1338364897611747428'],
			// Server
			['Giveaways', '1338366956570411020'],
			['Updates', '1338366980268228698'],
			['Vacancy', '1338367019648811048'],
		]);

		const regionRoles = [
			'1338363578184372306',
			'1338363779632599103',
			'1338363641023434793',
			'1338363676792455189',
			'1338363761135714344',
			'1338363699768983562',
		];
		const gameRoles = [
			'1338364763364786257',
			'1338364804359786569',
			'1338364828170846291',
			'1338364853429211278',
			'1338364897611747428',
		];

		if (interaction.isStringSelectMenu()) {
			const selectedIds = interaction.values;

			if (interaction.customId === 'selfRoles-region' && selectedIds.length > 0) {
				for (const roleId of regionRoles) {
					if (interaction.member.roles.cache.has(roleId)) await interaction.member.roles.remove(roleId);
				}

				const newRegionRole = selectedIds[0];
				await interaction.member.roles.add(newRegionRole);

				await interaction.reply({
					content: `Your region role has been updated to <@&${newRegionRole}>.`,
					flags: 'Ephemeral',
				});
				return;
			}

			if (interaction.customId === 'selfRoles-games' && selectedIds.length > 0) {
				// Allow multiple game roles
				const addedRoles: string[] = [];
				const removedRoles: string[] = [];

				for (const roleId of selectedIds) {
					if (!interaction.member.roles.cache.has(roleId)) {
						await interaction.member.roles.add(roleId);
						addedRoles.push(`<@&${roleId}>`);
					}
				}

				// Remove roles that weren't selected
				for (const roleId of gameRoles) {
					if (!selectedIds.includes(roleId) && interaction.member.roles.cache.has(roleId)) {
						await interaction.member.roles.remove(roleId);
						removedRoles.push(`<@&${roleId}>`);
					}
				}

				let content = '';
				if (addedRoles.length > 0) content += `Added roles: ${addedRoles.join(', ')}\n`;

				if (removedRoles.length > 0) content += `Removed roles: ${removedRoles.join(', ')}`;

				await interaction.reply({
					content: content || 'No role changes were made.',
					flags: 'Ephemeral',
				});
				return;
			}
		}

		if (interaction.isButton()) {
			const roleType = interaction.customId.split('selfRoles-')[1];
			const roleId = rolesMap.get(roleType);
			if (!roleId) return;

			if (interaction.member.roles.cache.has(roleId)) {
				await interaction.member.roles.remove(roleId);
				await interaction.reply({
					content: `The <@&${roleId}> role has been **removed** from you successfully!`,
					flags: 'Ephemeral',
				});
			} else {
				await interaction.member.roles.add(roleId);
				await interaction.reply({
					content: `The <@&${roleId}> role has been **added** to you successfully!`,
					flags: 'Ephemeral',
				});
			}
		}
	}
}
