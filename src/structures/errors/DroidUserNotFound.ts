import { MikoError } from "@structures/errors";

export class DroidUserNotFound extends MikoError {
    public log_blocked: boolean = true;
    constructor(message: string) {
        super(message);
        this.name = "InvalidDroidUser";
    }
}