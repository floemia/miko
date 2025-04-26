import { client } from "../..";


export const full = (int_or_code: number | string) => {
	if (typeof (int_or_code) == "number") {
		switch (int_or_code) {
			case 0: return "<:osu:955183369954680922>  osu!";
			case 1: return "<:taiko:955183369912721428>  osu!taiko";
			case 2: return "<:ctb:955183369740775504>  osu!catch";
			case 3: return "<:mania:955183369816256523>  osu!mania";
			default: return "<:osu:955183369954680922>  osu!";
		}
	} else {
		switch (int_or_code) {
			case "osu": return "<:osu:955183369954680922>  osu!";
			case "taiko": return "<:taiko:955183369912721428>  osu!taiko";
			case "fruits": return "<:ctb:955183369740775504>  osu!catch";
			case "mania": return "<:mania:955183369816256523>  osu!mania";
			default: return "<:osu:955183369954680922>  osu!";
		}
	}
}

export const difficulty = (mode: "osu" | "taiko" | "fruits" | "mania", SR: number) => {
	var rank = 1
	if (SR < 1.70) {
		rank = 1
	} else if (SR < 2.7) {
		rank = 2
	} else if (SR < 3.7) {
		rank = 3
	} else if (SR < 4.7) {
		rank = 4
	} else if (SR < 5.7) {
		rank = 5
	} else if (SR < 6.7) {
		rank = 6
	} else if (SR < 7.7) {
		rank = 7
	} else if (SR < 8.7) {
		rank = 8
	} else {
		rank = 9
	}
	const emoji = client.emojis.cache.find(emoji => emoji.name === `${mode}${rank}`)
	return emoji;
}

export const rank = async (rank: string) => {
	switch (rank) {
		case "A":
			return client.user.id == "953705293345325146" ? await client.application.emojis.fetch('1307062427304591480') :
				client.emojis.cache.get('954909322503155722')
		case 'B':
			return client.user.id == "953705293345325146" ? await client.application.emojis.fetch('1307062442542760007') :
				client.emojis.cache.get('954909322540879892')
		case 'C':
			return client.user.id == "953705293345325146" ? await client.application.emojis.fetch('1307062454806777937') :
				client.emojis.cache.get('954909322515738654')
		case 'D':
			return client.user.id == "953705293345325146" ? await client.application.emojis.fetch('1307062469964861510') :
				client.emojis.cache.get('954909322117275719')
		case 'S':
			return client.user.id == "953705293345325146" ? await client.application.emojis.fetch('1307062491225788456') :
				client.emojis.cache.get('954909322167599125')
		case 'SH':
			return client.user.id == "953705293345325146" ? await client.application.emojis.fetch('1307062505444610058') :
				client.emojis.cache.get('954909322515738624')
		case 'X':
			return client.user.id == "953705293345325146" ? await client.application.emojis.fetch('1307062520242114621') :
				client.emojis.cache.get('954909954995798066')
		case 'XH':
			return client.user.id == "953705293345325146" ? await client.application.emojis.fetch('1307062405188030464') :
				client.emojis.cache.get('954909954966425631')
		case 'F':
			return client.emojis.cache.get('966098768908914778')
	}
}

const emoji = { rank, difficulty }
const gamemode = { full }

export const osu = { emoji, gamemode }