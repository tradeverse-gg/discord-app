import { Module } from '@nestjs/common';

import { PremiumRoleModule } from './premiumRole/premiumRole.module';

@Module({
	imports: [PremiumRoleModule],
	exports: [PremiumRoleModule],
})
export class EventsModule {}
