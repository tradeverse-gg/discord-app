import { ComponentPayload } from '@/components/components.types';
import { AbstractDefaultButtonConsumer } from '@/core/abstract/consumer/interaction/button.consumer.abstract';
import { DiscordProducerService } from '@/producers/discord/discord-producer.service';
import { Injectable } from '@nestjs/common';
import { ButtonInteraction, CacheType } from 'discord.js';
import { PingCommandService } from './ping-command.service';
import { PingAction, PingButtonProps } from './ping.types';

@Injectable()
export class PingButtonService extends AbstractDefaultButtonConsumer {
    public readonly enabled: boolean = true;
    private async refreshButton(interaction: ButtonInteraction<CacheType>): Promise<void> {
        await interaction.deferUpdate();

        if (this.pingCommand.isCached) return;

        const content = await this.pingCommand.getContent(interaction);
        await interaction.editReply({ embeds: content.embeds });
    }

    constructor(
        public discordProducer: DiscordProducerService,
        public pingCommand: PingCommandService,
    ) {
        super(discordProducer, 'PingButtonService', pingCommand.slashCommand.name);
    }

    public async onButtonExecution(
        interaction: ButtonInteraction<CacheType>,
        payload: ComponentPayload<PingButtonProps>,
    ): Promise<void> {
        switch (payload.data?.action) {
            case PingAction.Refresh:
                await this.refreshButton(interaction);
                break;
            default:
                await interaction.deferUpdate();
                break;
        }
    }
}
