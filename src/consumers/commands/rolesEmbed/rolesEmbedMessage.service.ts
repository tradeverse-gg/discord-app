import { Injectable } from '@nestjs/common';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    StringSelectMenuBuilder,
    TextChannel,
    Webhook,
} from 'discord.js';

import { AbstractDefaultMessageCommandConsumer } from '@/core/abstract/consumer/message/message.consumer.abstract';
import { DiscordProducerService } from '@/producers/discord/discord-producer.service';

@Injectable()
export class RolesEmbedMessageService extends AbstractDefaultMessageCommandConsumer {
    public readonly name: string = 'rolesembed';
    public readonly description: string = 'Create or edit the Tradeverse roles embed message.';
    public readonly enabled: boolean = true;

    constructor(protected readonly discordProducer: DiscordProducerService) {
        super(discordProducer, 'roles-embed');
    }

    public async onMessageExecuted(message: Message): Promise<void> {
        if (message.author.id !== '392779025803771904') return;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, action] = message.content.toLowerCase().split(' ');

        const roleChannelId = '1337072146761125908';
        const ruleChannelId = '1337072146761125908';

        const roleChannel = message.guild?.channels.cache.get(roleChannelId) as TextChannel;
        const ruleChannel = message.guild?.channels.cache.get(ruleChannelId) as TextChannel;

        if (!roleChannel || !ruleChannel) {
            await message.reply('One or more required channels not found.');
            return;
        }

        try {
            if (action === 'update') {
                const roleWebhook = await this.findExistingWebhook(roleChannel, 'Role Selector');
                const ruleWebhook = await this.findExistingWebhook(ruleChannel, 'Rules');

                if (!roleWebhook || !ruleWebhook) {
                    await message.reply('One or more webhooks not found. Use `!rolesembed create` first.');
                    return;
                }

                await this.updateEmbeds(roleWebhook, ruleWebhook);
                await message.reply('Embeds updated successfully!');
            } else {
                const ruleWebhook = await this.findOrCreateWebhook(ruleChannel, 'Rules');
                const roleWebhook = await this.findOrCreateWebhook(roleChannel, 'Role Selector');

                await this.sendEmbeds(ruleWebhook, roleWebhook);
                await message.reply('New embeds created successfully!');
            }
        } catch (error) {
            this.consoleLogger.error('Error handling embeds:', error);
            await message.reply('An error occurred while handling the embeds.');
        }
    }

    private async findExistingWebhook(channel: TextChannel, webhookName: string): Promise<Webhook | undefined> {
        const webhooks = await channel.fetchWebhooks();
        return webhooks.find((webhook) => webhook.name === webhookName);
    }

    private async createWebhook(channel: TextChannel, webhookName: string): Promise<Webhook> {
        return await channel.createWebhook({
            name: webhookName,
            // avatar: 'https://cdn.discordapp.com/avatars/853629533855809596/a_4e9b12420d607a91fe65c3f7a035398f.png?size=4096',
        });
    }

    private async findOrCreateWebhook(channel: TextChannel, webhookName: string): Promise<Webhook> {
        const existingWebhook = await this.findExistingWebhook(channel, webhookName);
        if (existingWebhook) {
            return existingWebhook;
        }
        return await this.createWebhook(channel, webhookName);
    }

    private async updateEmbeds(roleWebhook: Webhook, ruleWebhook: Webhook): Promise<void> {
        const ruleMessages = await ruleWebhook.channel.messages.fetch({ limit: 50 });
        const ruleMessage = ruleMessages.find((m) => m.author.id === ruleWebhook.id);

        if (ruleMessage) {
            await ruleWebhook.editMessage(ruleMessage.id, {
                embeds: [this.getRuleEmbed()],
            });
        }

        const messages = await roleWebhook.channel.messages.fetch({ limit: 50 });
        const roleMessage = messages.find((m) => m.author.id === roleWebhook.id);

        if (roleMessage) {
            await roleWebhook.editMessage(roleMessage.id, {
                embeds: [this.getRoleEmbed()],
                components: [this.getRegionSelectMenu(), this.getGamesSelectMenu(), this.getServerRoleButtons()],
            });
        }
    }

    private async sendEmbeds(ruleWebhook: Webhook, roleWebhook: Webhook): Promise<void> {
        await ruleWebhook.send({
            embeds: [this.getRuleEmbed()],
        });

        await roleWebhook.send({
            embeds: [this.getRoleEmbed()],
            components: [this.getRegionSelectMenu(), this.getGamesSelectMenu(), this.getServerRoleButtons()],
        });
    }

    private getRoleEmbed() {
        return {
            title: 'Tradeverse Selfroles',
            description:
                '**Region**\n\n' +
                '<:dot:1338437083269955638> <@&1338363578184372306>\n' +
                '<:dot:1338437083269955638> <@&1338363779632599103>\n' +
                '<:dot:1338437083269955638> <@&1338363641023434793>\n' +
                '<:dot:1338437083269955638> <@&1338363676792455189>\n' +
                '<:dot:1338437083269955638> <@&1338363761135714344>\n' +
                '<:dot:1338437083269955638> <@&1338363699768983562>\n\n' +
                '**Games**\n\n' +
                '<:dot:1338437083269955638> <@&1338364763364786257>\n' +
                '<:dot:1338437083269955638> <@&1338364804359786569>\n' +
                '<:dot:1338437083269955638> <@&1338364828170846291>\n' +
                '<:dot:1338437083269955638> <@&1338364853429211278>\n' +
                '<:dot:1338437083269955638> <@&1338364897611747428>\n\n' +
                '**Server**\n\n' +
                '<:dot:1338437083269955638> <@&1338366956570411020> : For any Giveaways in the server\n' +
                '<:dot:1338437083269955638> <@&1338366980268228698> : For any Sofi Updates or News\n' +
                '<:dot:1338437083269955638> <@&1338367019648811048> : Get reminded of Team Role vacancies',
            color: 0xffa500,
        };
    }

    private getRuleEmbed() {
        return {
            title: 'Tradeverse Rules',
            description:
                '```1. Respect All Members\n' +
                'Harassment, hate speech, and discrimination will not be tolerated. Please be kind to others.```\n\n' +
                '```2. Follow Discord TOS & Community Guidelines\n' +
                "No NSFW content, illegal activities, or anything that violates Discord's Terms of Service.```\n" +
                '[Guidelines](https://discordapp.com/guidelines) and [TOS](https://discordapp.com/terms)\n\n' +
                '```3. No Spamming or Flooding\n' +
                'Avoid excessive messages, tagging, or disruptive behavior. This can include walls of text.```\n\n' +
                '```4. Keep Conversations in the Right Channels\n' +
                'Use the correct channels for trading, general chat, bot commands, etc.```\n\n' +
                '```5. No Impersonation or Scamming\n' +
                'Do not impersonate other users, staff, or bots. Scamming will lead to a permanent ban and it will be unappealable.```\n\n' +
                '```6. Cross-Trading Allowed\n' +
                'As this server is intended for, you may trade between different anime card bots (e.g., sofi, mazoku, shoob, etc.).```\n\n' +
                '```7. Money Trades Are Allowed (At Your Own Risk)\n' +
                'You may trade cards for real money, but:\n' +
                'Staff WILL NOT intervene in any monetary disputes.\n' +
                "Ensure you trust who you're trading with.\n" +
                'Use safe payment methods (e.g., PayPal G&S, middlemen, etc.).```\n\n' +
                '```8. Use Trusted Middlemen\n' +
                'If needed, use a staff-approved middleman for high-value trades.```\n\n' +
                '```9. No False Advertising\n' +
                "Do not misrepresent what you're offering or manipulate trade values.```\n\n" +
                '```10. No Forced or Unfair Trades\n' +
                'Both parties must agree willingly. Any form of coercion is prohibited.```\n\n' +
                'Safe Trading Tips\n' +
                '✅ Always screenshot trade agreements\n' +
                '✅ Confirm bot commands and card details before accepting a trade\n' +
                '✅ If using a middleman, confirm their legitimacy with a staff member\n' +
                '✅ Be cautious when dealing with new or unverified traders\n\n' +
                '*By staying in this server, you agree to follow these rules. The staff team is here to enforce rules, but not to resolve money disputes. Trade smart and stay safe!*',
            color: 0xffa500,
        };
    }

    private getRegionSelectMenu() {
        return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selfRoles-region')
                .setPlaceholder('Select your region')
                .addOptions(
                    { label: 'Asia', value: '1338363578184372306', emoji: '🌏' },
                    { label: 'Africa', value: '1338363779632599103', emoji: '🌍' },
                    { label: 'North America', value: '1338363641023434793', emoji: '🌎' },
                    { label: 'South America', value: '1338363676792455189', emoji: '🌎' },
                    { label: 'Europe', value: '1338363761135714344', emoji: '🌍' },
                    { label: 'Oceania', value: '1338363699768983562', emoji: '🌏' },
                ),
        );
    }

    private getGamesSelectMenu() {
        return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selfRoles-games')
                .setPlaceholder('Select your games')
                .setMinValues(1)
                .setMaxValues(5)
                .addOptions(
                    { label: 'Sofi Player', value: '1338364763364786257', emoji: '🎮' },
                    { label: 'Mazoku Player', value: '1338364804359786569', emoji: '🎮' },
                    { label: 'Miyori Player', value: '1338364828170846291', emoji: '🎮' },
                    { label: 'Shoob Player', value: '1338364853429211278', emoji: '🎮' },
                    { label: 'Tofu Player', value: '1338364897611747428', emoji: '🎮' },
                ),
        );
    }

    private getServerRoleButtons() {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Giveaways')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🎁')
                .setCustomId('selfRoles-Giveaways'),
            new ButtonBuilder()
                .setLabel('Updates')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📢')
                .setCustomId('selfRoles-Updates'),
            new ButtonBuilder()
                .setLabel('Staff Vacancy')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🧑‍💼')
                .setCustomId('selfRoles-Vacancy'),
        );
    }
}
