import { Module } from '@nestjs/common';

import { DiscordProducerModule } from '#producers/discord/discord-producer.module';

import { PremiumRoleMemberAddService } from './premiumRoleMemberAdd.service';
import { PremiumRoleMemberUpdateService } from './premiumRoleMemberUpdate.service';

@Module({
	imports: [DiscordProducerModule],
	providers: [PremiumRoleMemberAddService, PremiumRoleMemberUpdateService],
	exports: [PremiumRoleMemberAddService, PremiumRoleMemberUpdateService],
})
export class PremiumRoleModule {}
