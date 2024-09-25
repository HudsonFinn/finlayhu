export interface LogFn {
    (message?: any, ...optionalParams: any[]): any
}

export interface Logger {
    log: LogFn;
    warn: LogFn;
    error: LogFn;
}

export class ConsoleLogger implements Logger {
    log(message?: any, ...optionalParams: any[]): void {
        console.log(message, ...optionalParams)
    }

    warn(message?: any, ...optionalParams: any[]): void {
        console.warn(message, ...optionalParams)
    }

    error(message?: any, ...optionalParams: any[]): void {
        console.error(message, ...optionalParams)
    }
}