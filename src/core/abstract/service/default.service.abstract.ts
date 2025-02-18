import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Subject } from 'rxjs';

interface AbstractDefaultServiceInterface {
	readonly consoleLogger: Logger;
	readonly destroy$: Subject<void>;
	readonly enabled: boolean;
	onDestroy?: () => void;
	onInit?: () => void;
}

export abstract class AbstractDefaultService implements AbstractDefaultServiceInterface, OnModuleInit, OnModuleDestroy {
	public abstract readonly enabled: boolean;
	public readonly consoleLogger: Logger;
	public readonly destroy$ = new Subject<void>();

	protected get isProduction(): boolean {
		return process.env.NODE_ENV === 'production';
	}

	protected get isDevelopment(): boolean {
		return !this.isProduction;
	}

	constructor(protected readonly name: string) {
		this.consoleLogger = new Logger(name);
	}

	public onModuleInit(): void {
		if (this.enabled) {
			this.consoleLogger.log(`${this.name} initialising...`);
			this.onInit();
			this.consoleLogger.log(`${this.name} initialised`);
		}
	}

	public onModuleDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();

		if (this.enabled && this.onDestroy) 
			this.onDestroy();
		
		if (this.enabled) 
			this.consoleLogger.log(`${this.name} destroyed`);
		
	}

	public onInit(): void {
		// Do nothing
	}

	public onDestroy(): void {
		// Do nothing
	}
}
