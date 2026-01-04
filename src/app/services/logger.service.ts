import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
    Debug = 0,
    Info = 1,
    Warning = 2,
    Error = 3
}

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    private logLevel: LogLevel = environment.production ? LogLevel.Warning : LogLevel.Debug;

    debug(message: string, ...args: any[]): void {
        this.log(LogLevel.Debug, message, args);
    }

    info(message: string, ...args: any[]): void {
        this.log(LogLevel.Info, message, args);
    }

    warn(message: string, ...args: any[]): void {
        this.log(LogLevel.Warning, message, args);
    }

    error(message: string, error?: any): void {
        this.log(LogLevel.Error, message, error);

        // In production, you could send errors to a logging service
        if (environment.production && error) {
            this.sendToRemoteLogger(message, error);
        }
    }

    private log(level: LogLevel, message: string, ...args: any[]): void {
        if (level < this.logLevel) {
            return;
        }

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${LogLevel[level]}]`;

        switch (level) {
            case LogLevel.Debug:
                console.debug(prefix, message, ...args);
                break;
            case LogLevel.Info:
                console.info(prefix, message, ...args);
                break;
            case LogLevel.Warning:
                console.warn(prefix, message, ...args);
                break;
            case LogLevel.Error:
                console.error(prefix, message, ...args);
                break;
        }
    }

    private sendToRemoteLogger(message: string, error: any): void {
        // Implement remote logging service integration here
        // Example: Sentry, LogRocket, Application Insights, etc.
    }
}
