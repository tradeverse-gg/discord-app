import { Result } from 'oxide.ts';
import { Subject } from 'rxjs';
import { AbstractDefaultService } from '../service/default.service.abstract';

export interface AbstractDefaultProducerInterface<T, S extends Subject<Result<T, string>>> {
	readonly emit$: S;
}

export abstract class AbstractDefaultProducer<T, S extends Subject<Result<T, string>> = Subject<Result<T, string>>>
	extends AbstractDefaultService
	implements AbstractDefaultProducerInterface<T, S>
{
	public abstract readonly emit$: S;

	constructor(protected readonly name: string) {
		super(name);
	}

	public onModuleDestroy(): void {
		this.emit$.complete();
		if (this.enabled) {
			this.consoleLogger.log(`${this.name} emit stream destroyed`);
		}
		super.onModuleDestroy();
	}
}
