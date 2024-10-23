import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas"
import { getAverageColor } from "fast-average-color-node"
import { v2 } from "osu-api-extended"
import { droid } from "./functions"
import { DroidUser } from "./types"
import { average_color } from "../utils"
const getFlagEmojiUrl = (countryCode: string) => {
    const codePoints = countryCode
        .toLowerCase()
        .split('')
        .map(char => 0x1F1E6 + char.charCodeAt(0) - 97)
    const baseUrl = 'https://osu.ppy.sh/assets/images/flags/';
    const fileName = codePoints.map(cp => cp.toString(16)).join('-') + '.svg';
    return baseUrl + fileName;
}

export const generate_card = async (user: DroidUser): Promise<Buffer> =>  {

	const canvas = createCanvas(1000, 550)
	const ctx = canvas.getContext('2d')
	const gradient = ctx.createLinearGradient(640, 325, 840, 325)
	gradient.addColorStop(0, "rgba(255,255,255,1)")
	gradient.addColorStop(0.87, "rgba(255,255,255,1)")
	gradient.addColorStop(0.9, "rgba(255,255,255,0.4)")
	gradient.addColorStop(1, "rgba(255,255,255,0)")

	GlobalFonts.registerFromPath("./assets/fonts/SF-Pro-Rounded-Bold.otf", "sftitle");
	GlobalFonts.registerFromPath("./assets/fonts/SF-Pro-Rounded-Medium.otf", "sfbody");

	ctx.shadowColor="rgba(0,0,0,0.7)";
	ctx.shadowBlur=15;

	const background = await loadImage("./assets/images/pxfuel.jpg")
	const avatar = await loadImage(user.avatar_url)
	const flag = await loadImage(getFlagEmojiUrl(user.country))
	const osu_logo = await loadImage("https://cdn.discordapp.com/emojis/1021473577951821824.png?v=1")
	const color = await average_color(user.avatar_url)
	ctx.fillStyle = "rgba(0,0,0,0)"
	ctx.beginPath();
	ctx.roundRect(0, 0, 1000, 550, 30)
	ctx.closePath()
	ctx.clip()



	ctx.save()
	ctx.filter = "saturate(0%)"
	ctx.drawImage(background, 0, 0, 1000, 550)
	ctx.filter = "blur(7px) brightness(90%) saturate(0%)"
	ctx.drawImage(background, 0, 0, 1000, 550)
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = color.rgb.replace("rgb", "rgba").replace(")", ", 0.4)")
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.restore()

	ctx.fillStyle = "rgba(0,0,0,0.6)";
	ctx.fillRect(0, 260, 1000, 500);
	

	ctx.font = "15px sftitle";
	ctx.fillStyle = color.rgb;
	ctx.textAlign = "center"

	ctx.fillStyle = "rgba(255,255,255)"
	ctx.save()
	ctx.beginPath();
	ctx.roundRect(30, 30, 200, 200, 30)
	ctx.fill()
	ctx.closePath()
	ctx.clip()
	ctx.drawImage(avatar, 30, 30, 200, 200);
	ctx.restore()

	ctx.font = "45px sftitle";
	ctx.textAlign = "left"
	const region = new Intl.DisplayNames([`en`], { type: "region" })
	ctx.fillText(`${user.username}`, 270, 85);

	ctx.font = "28px sfbody";

	
	ctx.drawImage(flag, 270, 117, flag.width*1.1, flag.height*1.1);
	

	ctx.fillText(`${region.of(user.country)}`, 327, 147);

	ctx.save()
	ctx.filter = `blur(0.5px)`
	ctx.drawImage(osu_logo, 270, 178, 38, 38)
	ctx.restore()

	ctx.fillText("osu!droid", 327, 205);
	

	ctx.font = "15px sftitle";
	ctx.fillStyle = color.rgb
	ctx.save()
	if (color.isDark){
		ctx.filter = "brightness(200%)"
	}

	ctx.beginPath()
	ctx.roundRect(30, 290, 130, 10, 20)
	ctx.fillText("DPP", 30, 320)

	ctx.roundRect(190, 290, 130, 10, 20)
	ctx.fillText("DPP RANK", 190, 320)

	ctx.roundRect(350, 290, 130, 10, 20)
	ctx.fillText("SCORE RANK", 350, 320)

	ctx.fill()


	ctx.font = "30px sftitle";
	ctx.fillStyle = "rgb(255,255,255,255)"
	ctx.fillText(`${user.dpp.toLocaleString("en-US")}`, 30, 350)
	if (user.rank.dpp < 150 && user.rank.dpp > 50) {
		ctx.fillStyle  = "rgb(255, 238, 153)"
	} else if (user.rank.dpp < 50) {
		ctx.fillStyle = "rgb(154, 223, 234)"
	}

	ctx.fillText(`#${user.rank.dpp.toLocaleString("en-US")}`, 190, 350)
	ctx.fillStyle = "rgb(255,255,255,255)"
	if (user.rank.score < 150 && user.rank.score > 50) {
		ctx.fillStyle  = "rgb(255, 238, 153)"
	} else if (user.rank.score < 50) {
		ctx.fillStyle = "rgb(154, 223, 234)"
	}
	ctx.fillText(`#${user.rank.score.toLocaleString("en-US")}`, 350, 350)

	ctx.font = "25px sftitle";
	ctx.fillStyle = color.rgb
	ctx.fillText("RANKED SCORE", 30, 420)
	ctx.fillText("HIT ACCURACY", 30, 465)
	ctx.fillText("PLAYCOUNT", 30, 510)

	ctx.font = "25px sfbody";
	ctx.fillStyle = "rgb(255,255,255,255)"
	ctx.textAlign = "right"
	ctx.fillText(user.total_score.toLocaleString(), 480, 420)
	ctx.fillText(`${user.accuracy.toFixed(2)}%`, 480, 465)
	ctx.fillText(user.playcount.toLocaleString("en-US"), 480, 510)

	
	
	ctx.restore()
	var y = 322
	var card_y = 290

	if (user.scores.best){
		if (user.scores.best.length > 3) user.scores.best.length = 3
		for await (const score of user.scores.best) {
			ctx.save()
			const beatmap = await v2.beatmap.id.lookup({ checksum: score.hash })
			try{
				const card = await loadImage(beatmap.beatmapset.covers.card)
				
				ctx.beginPath()
				
				ctx.roundRect(530, card_y, 440, 75, 15)
				ctx.filter = "brightness(60%) blur(2px)"
				ctx.clip()
				if (card) ctx.drawImage(card, 530, card_y, card.width*1.1, card.height * 1.1)
				
				ctx.closePath()
			} catch (error) {
				console.log(error)
				continue;
			}

			ctx.restore()
			ctx.shadowColor="rgba(0,0,0,0.8)";
			ctx.shadowBlur=10;

			const rank = await loadImage(`https://osudroid.moe/assets/img/ranking-${score.rank}.png`)
			ctx.drawImage(rank, 535, y - 20 , rank.width / 3, rank.height / 3)

			ctx.fillStyle = "rgba(255,255,255,1)";
			ctx.textAlign = "left"
			ctx.font = "19px sftitle"
			ctx.fillStyle = gradient
			ctx.fillText(beatmap.beatmapset.title, 600, y)	
			ctx.font = "13px sfbody";
			const mods = await droid.mods(score.mods)
			var mods_str = mods.str
			if (mods.speed != 1.0) 
				mods_str = mods_str.concat(` (${mods.speed.toFixed(2)}x)`)
			ctx.fillText(`[${beatmap.version}] +${mods_str} ${score.accuracy}%`, 600, y + 26)
			ctx.fillStyle = "rgba(255,255,255,1)";
			ctx.font = "25px sftitle";
			ctx.textAlign = "right"
			ctx.fillText(`${score.scraped_pp}dpp`, 950,  y + 14)
			y += 77.5; card_y +=77.5;
		}
	}
	return await canvas.encode('png')
}