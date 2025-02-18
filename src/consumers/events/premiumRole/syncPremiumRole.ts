import type { GuildMember } from 'discord.js';

// Ideally, this will come from a database
// serverId, their premium roles, tradeverse premium role
const rolesMap = new Map<string, { serverPremium: string[]; tradeversePremium: string }>([
	[
		'863226120245215262',
		{
			serverPremium: [
				'1141811988482248835',
				'889630577324613653',
				'889630561503707197',
				'889630585813889104',
				'872790884662538281',
			],
			tradeversePremium: '1341493016078057532',
		},
	],
	[
		'1220895460533735424',
		{
			serverPremium: ['1221254709105524786', '1280641918191144970', '1280641807817900072', '1280641625068011670'],
			tradeversePremium: '1338364309364932619',
		},
	],
]);

export const servers = [...rolesMap.keys()];

export const syncPremiumRole = async (member: GuildMember) => {
	const guilds = member.client.guilds.cache.filter((guild) => rolesMap.has(guild.id));
	const shouldHavePremiums: string[] = [];

	const tradeverseGuild = member.client.guilds.cache.get('1250543265686622248');
	if (!tradeverseGuild) throw new Error('Main server not cached');

	const guildMember = await tradeverseGuild.members.fetch(member.id).catch(() => null);

	if (!guildMember) return;

	for (const guild of guilds.values()) {
		const serverData = rolesMap.get(guild.id);

		const serverMember = await guild.members.fetch(member.id).catch(() => null);

		if (!serverData?.serverPremium.length || !serverMember) continue;

		if (serverMember.roles.cache.hasAny(...serverData.serverPremium))
			shouldHavePremiums.push(serverData.tradeversePremium);
	}

	const rolesToAdd = shouldHavePremiums.filter((role) => !member.roles.cache.has(role));
	const rolesToRemove = [...member.roles.cache.filter((role) => shouldHavePremiums.includes(role.id)).keys()];

	if (rolesToAdd.length) await guildMember.roles.add(rolesToAdd);

	if (rolesToRemove.length) await guildMember.roles.remove(rolesToRemove);
};
