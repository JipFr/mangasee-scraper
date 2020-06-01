import { config } from "https://deno.land/x/dotenv/mod.ts";
const env = config();

import { Client } from "https://deno.land/x/coward/mod.ts";

let client = new Client(env.BOTTOKEN);

client.evt.ready.attach(() => {
	console.log("Bot is ready");
});

export default client;