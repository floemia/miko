import { Client, Collection } from "discord.js"
import type { GlobClient } from "./types"
import { handleEvents } from "./handlers/events"
import { utils } from "./utils"
import "dotenv/config"
utils.log.out({ prefix: "[STARTUP]", message: "Loading environmental variables and starting bot...", color: "Green", important: true })

export const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
}) as GlobClient

client.events = new Collection()
client.commands = new Collection()
client.cooldowns = new Collection();

handleEvents(client)
client.login(process.env.TOKEN)


