import { AbstractDefaultService } from '@/core/abstract/service/default.service.abstract';

interface AbstractDefaultconsumerInterface {}

export abstract class AbstractDefaultConsumer
    extends AbstractDefaultService
    implements AbstractDefaultconsumerInterface
{
    constructor(protected readonly name: string) {
        super(name);
    }
}
