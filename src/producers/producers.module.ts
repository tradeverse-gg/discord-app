import { Module } from '@nestjs/common';

import { DiscordProducerModule } from '@/producers/discord/disocrd-producer.module';

@Module({
    imports: [DiscordProducerModule],
    exports: [DiscordProducerModule],
})
export class ProducersModule {}
