import { ComponentPayload } from '@/components/components.types';
import { AbstractDefaultInteractionConsumer } from '@/core/abstract/consumer/interaction/interaction.consumer.abstract';
import { DiscordProducerService } from '@/producers/discord/discord-producer.service';
import { ButtonInteraction, Interaction } from 'discord.js';

export interface AbstractDefaultButtonConsumerInterface {
    slashCommandName: string;
    onButtonExecution(interaction: ButtonInteraction, payload: ComponentPayload): void | Promise<void>;
}

export abstract class AbstractDefaultButtonConsumer
    extends AbstractDefaultInteractionConsumer
    implements AbstractDefaultButtonConsumerInterface
{
    public abstract onButtonExecution(interaction: ButtonInteraction, payload: ComponentPayload): void | Promise<void>;

    public async onInteraction(interaction: Interaction): Promise<void> {
        if (interaction.isButton() && interaction.customId) {
            const payload: ComponentPayload = JSON.parse(interaction.customId);

            if (payload.cmd === this.slashCommandName) await this.onButtonExecution(interaction, payload);
        }
    }

    constructor(
        protected readonly discordProducer: DiscordProducerService,
        protected readonly name: string,
        public readonly slashCommandName: string,
    ) {
        super(discordProducer, name);
    }

    public onModuleInit(): void {
        super.onModuleInit();
    }

    public onModuleDestroy(): void {
        super.onModuleDestroy();
    }
}
