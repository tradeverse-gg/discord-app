import { ComponentsModule } from '@/components/components.module';
import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';

@Module({
    imports: [CommandsModule, ComponentsModule],
    exports: [CommandsModule, ComponentsModule],
})
export class ConsumersModule {}
