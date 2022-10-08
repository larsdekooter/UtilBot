import express from "express";
import path, { dirname } from "path";
import {
  ChatInputCommandInteraction,
  Client,
  InteractionResponseType,
  Member,
  verifyKeyMiddleware,
} from "kooterdiscordstructures";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static("Public"));

const client = new Client(app);

app.get("/", (req, res) =>
  res.sendFile("index.html", { root: path.join(__dirname, "Public") })
);

app.post(
  "/inter",
  verifyKeyMiddleware(
    "d8c09e3ffb1c254322b098b64801f519d5401b07feccc272954739fb81c6f49a"
  ),
  async (req, res) => {
    const interaction = new ChatInputCommandInteraction(res, req.body, client);
    await client.channels.fetch(interaction.channelId);
    if (interaction.guildId) {
      interaction.guild = await client.guilds.fetch(interaction.guildId);
      interaction.member = new Member(interaction._member, interaction.guild);
    }
    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: (Date.now() - interaction.createdTimestamp).toString() },
    });
  }
);

app.listen(3000, () => console.log("seeya"));
client.loginWithoutFetching(process.env.token);
