import { ComponentsModule } from '@/components/components.module';
import { ConsumersModule } from '@/consumers/consumers.module';
import { ProducersModule } from '@/producers/producers.module';
import { ServicesModule } from '@/services/services.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: false,
            envFilePath: '.env',
        }),
        ServicesModule,
        ProducersModule,
        ConsumersModule,
        ComponentsModule,
    ],
    providers: [],
})
export class AppModule {}
