import "dotenv/config"
import { Client, Collection } from "discord.js"
import type { GlobClient } from "./types"
import { handleEvents } from "./handlers/events"
import { CONFIG } from "./consts"
import { v2, auth } from "osu-api-extended"
import { osu_api_connect } from "./handlers/osu_api"
import { connect_mongoose } from "./handlers/mongoose"
import { droid_tracking } from "./handlers/tracking"

export const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
}) as GlobClient

client.config = CONFIG
client.events = new Collection()
client.commands = new Collection()
client.buttons = new Collection()

handleEvents(client)

client.login(process.env.TOKEN)

osu_api_connect()
connect_mongoose()
