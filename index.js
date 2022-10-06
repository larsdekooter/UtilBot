import express from "express";
import path, { dirname } from "path";
import {
  Client,
  InteractionType,
  Routes,
  Webhook,
} from "kooterdiscordstructures";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static("Public"));
/**
 * @type {Webhook}
 */
let webhook;

const client = new Client(app, {
  clientPublicKey:
    "d8c09e3ffb1c254322b098b64801f519d5401b07feccc272954739fb81c6f49a",
  route: "/inter",
});

app.get("/", (req, res) =>
  res.sendFile("index.html", { root: path.join(__dirname, "Public") })
);

client.on("interactionCreate", async (interaction) => {
  // if (!webhook) {
  //   const channel = client.channels.cache.get("982551387827224636");
  //   if (channel?.isTextBased()) {
  //     webhook = await channel.webhooks.fetch("1027229480340693084");
  //   } else
  //     webhook = new Webhook(
  //       await client.rest.get(Routes.webhook("1027229480340693084")),
  //       client
  //     );
  // }
  // webhook.send({
  //   content: `Recieved an interaction of type ${
  //     InteractionType[interaction.type]
  //   } in ${interaction.channel?.toString()} from ${interaction.user.toString()}`,
  //   allowedMentions: { users: [] },
  // });
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "grav") {
    if (!interaction.channel.isTextBased()) return;
    // await interaction.channel.bulkDelete(100, true);
    await interaction.reply("Cleared");
  }
});

client.on("ready", async () => {
  const channel = client.channels.cache.get("982551387827224636");
  if (channel?.isTextBased()) {
    webhook = await channel.webhooks.fetch("1027229480340693084");
  } else
    webhook = new Webhook(
      await client.rest.get(Routes.webhook("1027229480340693084")),
      client
    );
  console.log(client.isRatelimited);
});

app.listen(3000, () => console.log("seeya"));
client.login(process.env.token);
