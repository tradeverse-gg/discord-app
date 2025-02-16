import { AbstractDefaultService } from '#core/abstract/service/default.service.abstract';

export abstract class AbstractDefaultConsumer extends AbstractDefaultService {
	constructor(protected readonly name: string) {
		super(name);
	}
}
