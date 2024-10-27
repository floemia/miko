
import { ActivityType, PresenceData } from "discord.js"
import * as fs from "fs/promises"
import { GlobClient } from "../types";
export const presence_loop = async (client: GlobClient) => {
	const activities: PresenceData[] = [
		{ activities: [{ name: `bangers`, type: ActivityType.Listening }], status: "idle"},
		{ activities: [{ name: `osu!droid`, type: ActivityType.Playing }], status: "dnd"},
		{ activities: [{ name: `Michi's Gang`, type: ActivityType.Watching }], status: "online"},
		{ activities: [{ name: `osu!`, type: ActivityType.Competing }], status: "dnd"}
	]

	let current_act: PresenceData
	let current_pfp: string
	let act = activities
	let pfp = await fs.readdir("./assets/avatar")
	const activity_interval = () => {
		if (act.length == 0) act = activities
		let index = Math.floor( Math.random() * act.length )

		while( act[ index ] == current_act){
			index = Math.floor( Math.random() * act.length )
		}
		current_act = act[index]
		client.user.setPresence(current_act)
		act = act.filter( activity => activity != act[index])
	}

	const pfp_interval = async () => {
		if (pfp.length == 0) pfp = await fs.readdir("./assets/avatar")
		let index = Math.floor( Math.random() * pfp.length )
		while( pfp[ index ] == current_pfp){
			index = Math.floor( Math.random() * pfp.length )
		}
		current_pfp = pfp[index]
		await client.user.setAvatar(`./assets/avatar/${pfp[index]}`)
		act = act.filter( pic => pic != pfp[index])
	}

	activity_interval()
	// minutes
	setInterval(activity_interval, 5 * 60000);
	setInterval( async () => await pfp_interval(), 60 * 60000)

}