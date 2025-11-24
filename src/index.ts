import "dotenv/config";
import 'module-alias/register';

import { MikoClient } from "@core/MikoClient";
import { Logger as log } from "@utils/helpers";

const client = new MikoClient();

client.start().catch(err => {
    log.err({ prefix: "CLIENT", message: "An error has occurred.", error: err });
});

export { client };