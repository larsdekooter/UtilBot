import express from "express";
import path, { dirname } from "path";
import {
  ApplicationCommandType,
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  Interaction,
  InteractionResponseType,
  InteractionType,
  Member,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  UserContextMenuCommandInteraction,
  verifyKeyMiddleware,
} from "kooterdiscordstructures";
import { fileURLToPath } from "url";
import "dotenv/config";
import { DiscordSnowflake } from "@sapphire/snowflake";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static("Public"));

const client = new Client(app, {
  clientPublicKey:
    "d8c09e3ffb1c254322b098b64801f519d5401b07feccc272954739fb81c6f49a",
  route: "/inter",
});

app.get("/", (req, res) =>
  res.sendFile("index.html", { root: path.join(__dirname, "Public") })
);

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "response-time") {
      await interaction.reply(
        (Date.now() - interaction.createdTimestamp).toString()
      );
    } else if (interaction.commandName === "clear") {
      await interaction.channel.bulkDelete(100, true);
      await interaction
        .reply({ content: "clearage succesfull", fetchReply: true })
        .then(async (reply) => await reply.delete());
    }
  }
});
app.listen(3000, () => console.log("seeya"));
client.login(process.env.token);
