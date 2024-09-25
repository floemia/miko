import { auth } from "osu-api-extended"

export const osu_api_connect = async () => {
    if (process.env.OSU_CLIENT_ID && process.env.OSU_CLIENT_SECRET) {
        await auth.login(Number(process.env.OSU_CLIENT_ID), process.env.OSU_CLIENT_SECRET, ['public'])
    }
}