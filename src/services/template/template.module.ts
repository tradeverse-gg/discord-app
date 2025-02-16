import { Module } from '@nestjs/common';

import { TemplateService } from '#services/template/template.service';

@Module({
	providers: [TemplateService],
	exports: [TemplateService],
})
export class TemplateServiceModule {}
