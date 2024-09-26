export interface LogFn {
	(message?: unknown, ...optionalParams: unknown[]): void;
}

export interface Logger {
	info: LogFn;
	warn: LogFn;
	error: LogFn;
}

export class ConsoleLogger implements Logger {
	info(message?: unknown, ...optionalParams: unknown[]): void {
		console.log(message, ...optionalParams);
	}

	warn(message?: unknown, ...optionalParams: unknown[]): void {
		console.warn(message, ...optionalParams);
	}

	error(message?: unknown, ...optionalParams: unknown[]): void {
		console.error(message, ...optionalParams);
	}
}
