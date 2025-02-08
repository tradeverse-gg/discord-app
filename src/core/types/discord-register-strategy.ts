/**
 * @brief Discord register strategy
 * @description Determine where the slash command should be registered
 * @typedef DiscordRegisterStrategy Register to all guilds
 * @typedef DiscordRegisterStrategy Register to the development guild
 * @typedef DiscordRegisterStrategy Register to a specific guild
 */
export enum DiscordRegisterStrategy {
    GLOBAL = 'GLOBAL',
    DEV_GUILD = 'dev_guild',
    GUILD = 'guild',
}
