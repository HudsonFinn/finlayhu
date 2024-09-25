export interface LogFn {
    (message?: any, ...optionalParams: any[]): any
}

export interface Logger {
    info: LogFn;
    warn: LogFn;
    error: LogFn;
}

export class ConsoleLogger implements Logger {
    info(message?: any, ...optionalParams: any[]): void {
        console.log(message, ...optionalParams)
    }

    warn(message?: any, ...optionalParams: any[]): void {
        console.warn(message, ...optionalParams)
    }

    error(message?: any, ...optionalParams: any[]): void {
        console.error(message, ...optionalParams)
    }
}