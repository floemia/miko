import { GuildConfigModel } from "@structures/database/models/types";
import { APIEmbed, EmbedBuilder, Guild, User } from "discord.js";
import { DroidBanchoScore, DroidBanchoUser, DroidRXScore, DroidRXUser, DroidScore, DroidUser } from "@floemia/osu-droid-utils";
import { DroidServer} from "@structures/servers";
type DroidCardCache = {
    user: DroidUser,
    cardBuffer: Buffer<ArrayBufferLike>
}


export abstract class CacheManager {
    static bancho_score_embeds: Map<string, APIEmbed> = new Map()
    static rx_score_embeds: Map<string, APIEmbed> = new Map()
    static bancho_card_buffers: Map<number, DroidCardCache> = new Map()
    static rx_card_buffers: Map<number, DroidCardCache> = new Map()
    static bancho_users: Map<string, number> = new Map()
    static rx_users: Map<string, number> = new Map()
    static user_server: Map<string, DroidServer> = new Map()
    static guild_configs: Map<string, GuildConfigModel> = new Map()


    static setScoreEmbed(score: DroidScore, embed: EmbedBuilder): void {
        if (!score.id) return
        const map = score instanceof DroidBanchoScore ? this.bancho_score_embeds : this.rx_score_embeds;
        map.set(`${score.id}-${score.total_score}-${score.played_at}`, embed.toJSON());
    }

    static getScoreEmbed(score: DroidScore) {
        if (!score.id) return;
        const map = score instanceof DroidBanchoScore ? this.bancho_score_embeds : this.rx_score_embeds;
        return map.get(`${score.id}-${score.total_score}-${score.played_at}`);
    }

    static setDroidCard(user: DroidUser, cardBuffer: Buffer<ArrayBufferLike>): void {
        const map = user instanceof DroidBanchoUser ? this.bancho_card_buffers : this.rx_card_buffers;
        map.set(user.id, { user: user, cardBuffer: cardBuffer });
    }

    static getDroidCard(user: DroidUser): Buffer<ArrayBufferLike> | undefined {
        const map = user instanceof DroidBanchoUser ? this.bancho_card_buffers : this.rx_card_buffers;
        const card = map.get(user.id);
        if (!card || card.user.statistics.playcount != user.statistics.playcount) return;
        return card.cardBuffer;
    }

    static setLinkedUser(discord_user: User, user: DroidUser): void {
        const map = user instanceof DroidBanchoUser ? this.bancho_users : this.rx_users;
        map.set(discord_user.id, user.id);
    }

    static getLinkedUser(discord_user: User, server: DroidServer = "ibancho"): number | undefined {
        const map = server == "ibancho" ? this.bancho_users : this.rx_users;
        return map.get(discord_user.id);
    }

    static setDefaultServer(discord_user: User, server: DroidServer): void {
        this.user_server.set(discord_user.id, server);
    }

    static getDefaultServer(discord_user: User): DroidServer | undefined {
        return this.user_server.get(discord_user.id);
    }

    static getGuildConfig(guild: Guild): GuildConfigModel | undefined {
        return this.guild_configs.get(guild.id);
    }

    static setGuildConfig(guild: Guild, config: GuildConfigModel): void {
        this.guild_configs.set(guild.id, config);
    }
}