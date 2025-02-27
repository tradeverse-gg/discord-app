import { Module } from '@nestjs/common';

import { ButtonsComponentsService } from './buttons/buttons-component.service';
import { EmbedsComponentsService } from './embeds/embeds-component.service';

@Module({
	imports: [],
	providers: [ButtonsComponentsService, EmbedsComponentsService],
	exports: [ButtonsComponentsService, EmbedsComponentsService],
})
export class ComponentsModule {}
