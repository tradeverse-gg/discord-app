import { Module } from '@nestjs/common';

import { ComponentsModule } from '#components/components.module';

import { CommandsModule } from './commands/commands.module';
import { EventsModule } from './events/events.module';

@Module({
	imports: [CommandsModule, ComponentsModule, EventsModule],
	exports: [CommandsModule, ComponentsModule, EventsModule],
})
export class ConsumersModule {}
