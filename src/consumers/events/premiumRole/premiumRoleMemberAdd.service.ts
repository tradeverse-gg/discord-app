import { Injectable } from '@nestjs/common';

import { AbstractDefaultMemberAddCommandConsumer } from '#core/abstract/consumer/memberAdd/memberAdd.consumer.abstract';
import { DiscordProducerService } from '#producers/discord/discord-producer.service';

import { syncPremiumRole } from './syncPremiumRole';

import type { GuildMember } from 'discord.js';

@Injectable()
export class PremiumRoleMemberAddService extends AbstractDefaultMemberAddCommandConsumer {
	public readonly enabled: boolean = true;

	constructor(protected override readonly discordProducer: DiscordProducerService) {
		super(discordProducer, 'premium-role');
	}

	public override async onMemberAdd(member: GuildMember) {
		await syncPremiumRole(member);
	}
}
