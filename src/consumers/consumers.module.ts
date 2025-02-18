import { Module } from '@nestjs/common';

import { ComponentsModule } from '#components/components.module';

import { CommandsModule } from './commands/commands.module';

@Module({
	imports: [CommandsModule, ComponentsModule],
	exports: [CommandsModule, ComponentsModule],
})
export class ConsumersModule {}
