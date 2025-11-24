/**
 * Utility class for time-related operations.
 */
export abstract class TimeHelper {

    /**
     * A basic timer method.
     * @returns The time in seconds since the timer started.
     */
    static startTimer(): () => number {
        const start = Date.now();
        return () => ((Date.now() - start) / 1000);
    }

    /**
     * Returns The time in "es-ES" format.
     * @returns The current time in a formatted string.
    */
    static nowFormatted(): string {
        return new Date().toISOString()
    }

    static msToTime(ms: number): string {
        let str = ""
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        if (days > 0) str += `${days}d `;
        if (hours > 0) str += `${hours}h `;
        if (minutes > 0) str += `${minutes}m `;
        if (seconds > 0) str += `${seconds}s `;
        return str.trim();
    }

    static secondsToMapLength(seconds: number): string {
        //returns mm:ss from seconds
        const minutes = Math.floor(seconds / 60);
        const secondsLeft = Math.ceil(seconds % 60);
        const mm = `${minutes}`.padStart(2, "0");
        const ss = `${secondsLeft}`.padStart(2, "0");
        return `${mm}:${ss}`;
    }
}