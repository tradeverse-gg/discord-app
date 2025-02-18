import type { GuildMember } from 'discord.js';

// Ideally, this will come from a database
const rolesMap = new Map<string, string[]>([
	[
		'863226120245215262',
		['1141811988482248835', '889630577324613653', '889630561503707197', '889630585813889104', '872790884662538281'],
	],
]);

export const servers = [...rolesMap.keys()];

const PREMIUM_ROLE_ID = '1338364309364932619';

export const syncPremiumRole = async (member: GuildMember) => {
	const guilds = member.client.guilds.cache.filter((guild) => rolesMap.has(guild.id));
	let shouldHavePremium = false;

	for (const guild of guilds.values()) {
		const roles = rolesMap.get(guild.id);
		const guildMember = await guild.members.fetch(member.id).catch(() => null);

		if (!roles?.length || !guildMember) continue;

		if (guildMember.roles.cache.hasAny(...roles)) {
			shouldHavePremium = true;
			break;
		}
	}

	const guildMember = await member.guild.members.fetch(member.id);
	const hasPremiumRole = guildMember.roles.cache.has(PREMIUM_ROLE_ID);

	if (shouldHavePremium && !hasPremiumRole) await guildMember.roles.add(PREMIUM_ROLE_ID);
	else if (!shouldHavePremium && hasPremiumRole) await guildMember.roles.remove(PREMIUM_ROLE_ID);
};
