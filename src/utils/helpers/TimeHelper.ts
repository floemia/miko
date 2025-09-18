export abstract class TimeHelper {
    static startTimer(): () => number {
        const start = Date.now();
        return () => ((Date.now() - start) / 1000);
    }

    static nowFormatted(): string {
        return new Date().toLocaleString("es-ES", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
        });
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