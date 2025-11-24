import { DroidUser } from "@floemia/osu-droid-utils";
import { DroidServer, DroidServerData } from "@structures/osu!droid";
import { DroidHelper } from "@utils/helpers";
import { config } from "dotenv";

const droid_user_options: Record<string, string> = {
    user: "El usuario de Discord vinculado a la cuenta de osu!droid.",
    uid: "El UID del jugador.",
    username: "El username del jugador.",
    server: "El servidor desde el cual obtener los scores."
}

export default {
    general: {
        cooldown: (seconds: number) => `No vayas tan rápido! Por favor espera ${seconds.toFixed(1)} segundos.`,
        error: "Se ha producido un error.",
        user_dne: "Ese usuario no existe.",
        no_dev: "No eres un desarrollador de este bot.",
        mention_no_link: "El usuario mencionado no tiene una cuenta de osu!droid vinculada.",
        no_link: "No tienes una cuenta de osu!droid vinculada. Usa `/link` primero.",
        no_scores: `Este usuario no ha subido ningún score.`,
    },
    commands: {
        config: {
            track: {
                status: (enabled: boolean) => `El sistema de tracking de scores de osu!droid ahora ${enabled ? "está habilitado" : "está deshabilitado"}.`,
                channel: {
                    set: (channel: string, permission: boolean) => `El canal de tracking de scores de osu!droid ha sido establecido a ${channel}.${permission ? "" : ".. **pero no tengo permisos para enviar mensajes en ese canal!**"}`,
                }
            },
        },
        recent: {
            description: "Obtener los últimos scores tuyos o de un jugador.",
            options: { ...droid_user_options, index: "El n-ésimo score a mostrar (1 - 50). Por defecto, el último score." },
            responses: {
                process: (user: DroidUser) => `Procesando scores de ${DroidHelper.userToString(user, "flag")}...`,
            }
        },
        recent50: {
            description: "Obtener los últimos 50 scores tuyos o de un jugador.",
            options: droid_user_options
        },
        link: {
            description: "Vincula tu cuenta de Discord a un usuario de osu!droid.",
            options: droid_user_options,
            responses: {
                ok: (user: DroidUser) => `Tu cuenta de Discord ha sido vinculada a ${DroidHelper.userToString(user, "flag")}.`,
            }
        },
        defaultserver: {
            description: "Establece tu servidor predeterminado de osu!droid.",
            options: {
                server: "El servidor deseado.",
            },
            responses: {
                ok: (server: DroidServerData) => `Tu servidor predeterminado ahora es ${server.name}.`,
            }
        },
        card: {
            description: "Obtener tu tarjeta de perfil de osu!droid.",
            options: droid_user_options,
            responses: {
                generating: (user: DroidUser) => `Generando tarjeta de perfil de osu!droid de ${DroidHelper.userToString(user, "flag")}...`,
            }
        },
        top: {
            description: "Obtener los mejores scores tuyos o de un jugador.",
            options: droid_user_options,
            responses: {
                process: (user: DroidUser) => `Obteniendo los mejores scores de ${DroidHelper.userToString(user, "flag")}...`,
            }
        },
        tracking: {
            add: {
                description: "Añade un usuario al sistema de tracking de scores de osu!droid.",
                responses: {
                    ok: (user: DroidUser) => `${DroidHelper.userToString(user, "flag")} ha sido eliminado del sistema de tracking de scores de osu!droid.`,
                    already_in: `Ese usuario ya está en el sistema.`
                }
            },
            delete: {
                description: "Elimina un usuario del sistema de tracking de scores de osu!droid.",
                responses: {
                    ok: (user: DroidUser) => `${DroidHelper.userToString(user, "flag")} ha sido eliminado del sistema de tracking de scores de osu!droid.`,
                    not_in: `Ese usuario no está en el sistema.`
                }
            }
        }
    }
}