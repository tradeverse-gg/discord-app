import { DiscordProducerEventType, DiscordProducerService } from '@/producers/discord/discord-producer.service';
import { Events, Message } from 'discord.js';
import { Result } from 'oxide.ts';
import { takeUntil } from 'rxjs';
import { AbstractDefaultConsumer } from '../default.consumer.abstract';

export abstract class AbstractDefaultMessageCommandConsumer extends AbstractDefaultConsumer {
    public abstract readonly name: string;
    public abstract readonly description: string;
    protected readonly prefix: string = process.env.DISCORD_COMMAND_PREFIX || '?';

    public abstract onMessageExecuted(message: Message, args: string[]): void | Promise<void>;

    constructor(
        protected readonly discordProducer: DiscordProducerService,
        protected readonly serviceName: string,
    ) {
        super(serviceName);
    }

    public onModuleInit(): void {
        if (this.enabled) {
            this.discordProducer.message$
                .pipe(takeUntil(this.destroy$))
                .subscribe((result: Result<DiscordProducerEventType<Events.MessageCreate>, string>) => {
                    if (!result.isOk()) {
                        this.consoleLogger.error(result.unwrapErr());
                        return;
                    }

                    const [message] = result.unwrap().data;
                    if (!this.shouldHandleMessage(message)) {
                        return;
                    }

                    const args: string[] = message.content.slice(this.prefix.length).trim().split(/ +/);
                    const command: string | unknown = args.shift()?.toLowerCase();

                    if (command === this.name) {
                        try {
                            this.onMessageExecuted(message, args);
                        } catch (error) {
                            this.consoleLogger.error(`Error in ${this.name} onMessage:`, error);
                        }
                    }
                });
        }
        super.onModuleInit();
    }

    private shouldHandleMessage(message: Message): boolean {
        return (
            !message.author.bot &&
            message.content.startsWith(this.prefix) &&
            message.content.length > this.prefix.length
        );
    }
}
