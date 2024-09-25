import mongoose from "mongoose";
import { droid_tracking } from "./tracking";
export const connect_mongoose = () => {
    const MONGO_URI = process.env.MONGO_URI
    if (!MONGO_URI) return console.log(`Mongo URI no encontrado, saltando`)
    mongoose.connect(`${MONGO_URI}`)
    .then(() => {
        console.log(`La conexión con MongoDB fue exitosa.`)
        if (process.env.DROID_TRACKING_ENABLED == "true") {
            droid_tracking()
          }})
    .catch(() => console.log(`La conexión con MongoDB falló`))
}