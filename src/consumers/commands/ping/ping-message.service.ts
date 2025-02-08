import { Injectable } from '@nestjs/common';
import { ActionRowBuilder, BaseMessageOptions, ButtonBuilder, ButtonStyle, Message } from 'discord.js';

import { AbstractDefaultMessageCommandConsumer } from '@/core/abstract/consumer/message/message.consumer.abstract';
import { DiscordProducerService } from '@/producers/discord/discord-producer.service';

import { ButtonsComponentsProps, ButtonsComponentsService } from '@/components/buttons/buttons-component.service';
import { ComponentPayload } from '@/components/components.types';
import { EmbedComponentType, EmbedsComponentsService } from '@/components/embeds/embeds-component.service';

import { EmbedBuilder } from '@discordjs/builders';
import { PingAction, PingButtonProps } from './ping.types';

@Injectable()
export class PingMessageService extends AbstractDefaultMessageCommandConsumer {
    public readonly name: string = 'ping';
    public readonly description: string = `Check the bot's latency via a prefix command.`;
    public readonly enabled: boolean = true;

    public readonly systems: {
        name: string;
        emoji: (message?: Message) => string | Promise<string>;
        isAvailable: boolean;
        ping: number;
        computePing: (message: Message) => Promise<number> | number;
    }[] = [];

    private maxCacheTime = 1000 * 60 * 5; // 5 minutes
    private lastCacheTime = 0;

    public get isCached(): boolean {
        const now = Date.now();
        return now - this.lastCacheTime < this.maxCacheTime;
    }

    constructor(
        public readonly discordProducer: DiscordProducerService,
        public readonly embeds: EmbedsComponentsService,
        public readonly buttons: ButtonsComponentsService,
    ) {
        super(discordProducer, 'ping');
    }

    public async onMessageExecuted(message: Message): Promise<void> {
        const content: BaseMessageOptions = await this.getContent(message);
        await message.reply(content);
    }

    public async getContent(message: Message): Promise<BaseMessageOptions> {
        const buttonsRow: ActionRowBuilder<ButtonBuilder> = await this.computeButtons();

        try {
            await this.computePings(message);
            const allSystemsAvailable: boolean = this.systems.every((system) => system.isAvailable);

            const fields = [];
            for (const system of this.systems) {
                const emoji = await system.emoji(message);
                fields.push({
                    name: system.isAvailable ? `${emoji} ${system.name} Latency` : `:warning: ${system.name}`,
                    value: system.isAvailable ? `\`${system.ping}ms\`` : 'Unavailable',
                    inline: true,
                });
            }

            const embed: EmbedBuilder = this.embeds.embed({
                type: allSystemsAvailable ? EmbedComponentType.Default : EmbedComponentType.Error,
                description: allSystemsAvailable ? 'All systems are available.' : 'Some systems are not available.',
                fields,
            });

            return {
                embeds: [embed],
                components: [buttonsRow],
            };
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                this.consoleLogger.error(error);
            }
            return {
                embeds: [this.embeds.embed({ type: EmbedComponentType.Error })],
                components: [buttonsRow],
            };
        }
    }

    /**
     * Build the row of buttons for the prefix-based ping command
     */
    private async computeButtons(): Promise<ActionRowBuilder<ButtonBuilder>> {
        const buttons: ButtonsComponentsProps<ComponentPayload<PingButtonProps>>[] = [
            {
                label: 'Refresh',
                style: ButtonStyle.Primary,
                disabled: false,
                payload: {
                    cmd: 'ping-message',
                    data: {
                        action: PingAction.Refresh,
                        updatedAt: Date.now(),
                    },
                },
                emoji: { name: '🔄' },
            },
        ];

        return this.buttons.buttonRow(buttons);
    }

    /**
     * If not cached, compute the ping times for each system
     */
    private async computePings(message: Message): Promise<void> {
        if (this.isCached) return;

        await Promise.all(
            this.systems.map(async (system) => {
                system.ping = await system.computePing(message);
                system.isAvailable = system.ping !== -1;
            }),
        );

        this.lastCacheTime = Date.now();
    }

    private createDiscordSystem() {
        this.systems.push({
            name: 'Discord',
            emoji: async () => '💬',
            isAvailable: true,
            ping: 0,
            computePing: async (msg: Message) => {
                return Date.now() - msg.createdTimestamp;
            },
        });
    }

    private createSystems(): void {
        this.createDiscordSystem();
    }

    public async onInit(): Promise<void> {
        this.createSystems();
    }
}
