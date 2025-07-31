import { EmbedBuilder, User } from "discord.js";
import { client } from "@root";

export enum ResponseType {
    SUCCESS,
    ERROR,
    PROCESS,
}

export class ResponseEmbedBuilder extends EmbedBuilder {
    private type: ResponseType = ResponseType.SUCCESS;
    private author: User | undefined;

    setUser(user: User) {
        this.author = user;
        return this.setChanges();
    }
    setType(type: ResponseType) {
        this.type = type;
        return this.setChanges();
    }

    private setChanges() {
        switch (this.type) {
            case ResponseType.SUCCESS:
                this.setColor("Green")
                .setFooter({ text: client.user?.displayName!, iconURL: client.user?.displayAvatarURL() });
                if (this.author) this.setAuthor({ name: this.author.displayName, iconURL: this.author.displayAvatarURL() });
                break;
            case ResponseType.ERROR:
                this.setColor("Red")
                .setTitle("🔴 Error!")
                .setFooter({ text: client.user?.displayName!, iconURL: client.user?.displayAvatarURL() })
                if (this.author) this.setAuthor({ name: this.author.displayName, iconURL: this.author.displayAvatarURL() });
                break;
            case ResponseType.PROCESS:
                this.setColor("LightGrey")
                .setAuthor(null)
                .setFooter(null)
                .setTitle(null);
                break;
        }
        return this;
    }

    setDescription(description: string | null) {
        if (description === null) return super.setDescription(null);
        return super.setDescription(`> ${description}`);
    }
}