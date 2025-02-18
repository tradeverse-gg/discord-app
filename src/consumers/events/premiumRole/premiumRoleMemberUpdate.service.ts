import { Injectable } from '@nestjs/common';
import { type GuildMember } from 'discord.js';


import { AbstractDefaultMemberUpdateCommandConsumer } from '#core/abstract/consumer/memberUpdate/memberUpdate.consumer.abstract';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

import { servers, syncPremiumRole } from './syncPremiumRole';

@Injectable()
export class PremiumRoleMemberUpdateService extends AbstractDefaultMemberUpdateCommandConsumer {
	public readonly enabled: boolean = true;

	constructor(protected override readonly discordProducer: DiscordProducerService) {
		super(discordProducer, 'premium-role');
	}

	public override async onMemberUpdate(oldMember: GuildMember, newMember: GuildMember) {
		if (!servers.includes(newMember.guild.id)) return;

		if (oldMember.roles.cache.equals(newMember.roles.cache)) return;
		await syncPremiumRole(newMember);
	}
}
