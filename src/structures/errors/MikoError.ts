export class MikoError extends Error {
    public log_blocked: boolean = false;
    constructor(message: string) {
        super(message);
        this.name = "MikoError";
    }
}