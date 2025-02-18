import { Injectable } from '@nestjs/common';
import {
	ActivitiesOptions,
	ActivityType,
	Client,
	GatewayIntentBits,
	Partials,
	PresenceStatusData,
	REST,
	Routes,
	SlashCommandBuilder,
} from 'discord.js';
import { Err, Ok, Result } from 'oxide.ts';
import { Observable, from, takeUntil } from 'rxjs';

import { AbstractDefaultService } from '#core/abstract/service/default.service.abstract';
import { DiscordRegisterStrategy } from '#core/types/discord-register-strategy';

export interface DiscordInteraction {
	registerStrategy: DiscordRegisterStrategy;
	slashCommand: SlashCommandBuilder;
}

/**
 * @description
 * This service is used to interact with the Discord API.
 */
@Injectable()
export class DiscordService extends AbstractDefaultService {
	public readonly enabled: boolean = true;
	public readonly client: Client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.MessageContent,
		],
		partials: [Partials.Message, Partials.User, Partials.Channel],
		failIfNotExists: false,
	});

	private readonly discordToken = process.env.DISCORD_TOKEN;
	private readonly discordClientId = process.env.DISCORD_CLIENT_ID;
	private readonly discordGuild = process.env.DISCORD_GUILD_ID;
	private readonly discordDevGuild = process.env.DISCORD_DEV_GUILD_ID;

	private _interactions: DiscordInteraction[] = [];

	private rest: REST = new REST({ version: '10' });

	public get interactions(): DiscordInteraction[] {
		return this._interactions;
	}

	private set interactions(value: DiscordInteraction[]) {
		this._interactions = value;
	}

	/**
	 * @brief Log the Discord App into Discord
	 * @returns
	 */
	public login(): Observable<Result<string, string>> {
		this.consoleLogger.log('Logging in Discord bot...');
		if (!this.discordToken) {
			this.consoleLogger.error('No Discord token provided');
			return from(Promise.resolve(Err('No Discord token provided')));
		}

		return from(
			this.client
				.login(this.discordToken)
				.then((token: string) => {
					this.consoleLogger.log('Discord bot logged in successfully');
					return Ok(token);
				})
				.catch((error: Error) => {
					this.consoleLogger.error(`Failed to login: ${error.message}`);
					return Err(error.message);
				}),
		);
	}

	public registerCommands(commands: unknown): Observable<Result<boolean, string>> {
		if (!this.discordToken) {
			this.consoleLogger.error('No Discord token provided');
			return from(Promise.resolve(Err('No Discord token provided')));
		}

		if (!this.discordClientId) {
			this.consoleLogger.error('No Discord client ID provided');
			return from(Promise.resolve(Err('No Discord client ID provided')));
		}

		if (!this.discordDevGuild) {
			this.consoleLogger.error('No Discord dev guild provided');
			return from(Promise.resolve(Err('No Discord dev guild provided')));
		}

		this.rest.setToken(this.discordToken);

		return from(
			this.rest
				.put(Routes.applicationCommands(this.discordClientId), {
					body: commands,
				})
				.then(() => Ok(true))
				.catch((error: Error) => Err(error.message)),
		);
	}

	public registerGuildCommands(guildId: string, commands: unknown): Observable<Result<boolean, string>> {
		if (!this.discordToken) {
			this.consoleLogger.error('Discord token not found');
			return from(Promise.resolve(Err('Discord token not found')));
		}
		if (!this.discordClientId) {
			this.consoleLogger.error('Discord client id not found');
			return from(Promise.resolve(Err('Discord client id not found')));
		}

		this.rest.setToken(this.discordToken);

		return from(
			this.rest
				.put(Routes.applicationGuildCommands(this.discordClientId, guildId), { body: commands })
				.then(() => Ok(true))
				.catch((error: Error) => Err(error.message)),
		);
	}

	public registerInternalInteraction(
		registerStrategy: DiscordRegisterStrategy,
		slashCommand: SlashCommandBuilder,
	): void {
		const newInteractions = this.interactions;
		newInteractions.push({ registerStrategy, slashCommand });
		this.interactions = newInteractions;
	}

	public registerDiscordInteractions(): void {
		if (!this.discordToken) {
			this.consoleLogger.error('Discord token not found');
			return;
		}
		if (!this.discordClientId) {
			this.consoleLogger.error('Discord client id not found');
			return;
		}
		if (!this.discordGuild) {
			this.consoleLogger.error('Discord guild id not found');
			return;
		}
		if (!this.discordDevGuild) {
			this.consoleLogger.error('Discord dev guild id not found');
			return;
		}
		this.consoleLogger.log(`Started registering ${this.interactions.length} interactions.`);

		const globalInteractions: SlashCommandBuilder[] = [];
		const guildInteractions: SlashCommandBuilder[] = [];
		const devGuildInteractions: SlashCommandBuilder[] = [];

		for (const interaction of this.interactions) {
			switch (interaction.registerStrategy) {
				case DiscordRegisterStrategy.GLOBAL:
					globalInteractions.push(interaction.slashCommand);
					break;
				case DiscordRegisterStrategy.GUILD:
					guildInteractions.push(interaction.slashCommand);
					break;
				case DiscordRegisterStrategy.DEV_GUILD:
					devGuildInteractions.push(interaction.slashCommand);
					break;
			}
		}

		const onRegistration = (result: Result<boolean, string>, successMsg: string, errorMsg: string) => {
			if (result.isOk()) this.consoleLogger.log(successMsg);
			else this.consoleLogger.error(`${errorMsg}: ${result.unwrapErr()}`);
		};

		if (globalInteractions.length > 0) {
			this.consoleLogger.log('Started registering application (/) commands.');
			this.registerCommands(globalInteractions)
				.pipe(takeUntil(this.destroy$))
				.subscribe((result) => {
					onRegistration(
						result,
						'Successfully registered application (/) commands.',
						'Failed to register application (/) commands',
					);
				});
		}
		if (guildInteractions.length > 0) {
			this.consoleLogger.log('Started registering guild (/) commands.');
			this.registerGuildCommands(this.discordGuild, guildInteractions)
				.pipe(takeUntil(this.destroy$))
				.subscribe((result) => {
					onRegistration(
						result,
						'Successfully registered guild (/) commands.',
						'Failed to register guild (/) commands',
					);
				});
		}
		if (devGuildInteractions.length > 0) {
			this.consoleLogger.log('Started registering development guild (/) commands.');
			this.registerGuildCommands(this.discordDevGuild, devGuildInteractions)
				.pipe(takeUntil(this.destroy$))
				.subscribe((result: Result<boolean, string>) => {
					onRegistration(
						result,
						'Successfully registered development guild (/) commands.',
						'Failed to register development guild (/) commands',
					);
				});
		}
	}

	public setPresence(status: PresenceStatusData, activities: ActivitiesOptions[]): void {
		this.client.user?.setPresence({
			activities: [...activities, { type: ActivityType.Watching, name: 'for commands' }],
			status,
		});
	}

	constructor() {
		super('DiscordService');
	}

	public onDestroy(): void {
		this.client.destroy();
	}
}
