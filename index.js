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
    let interaction;
    switch (req.body.type) {
      case InteractionType.ApplicationCommand: {
        if (req.body.data.type === ApplicationCommandType.ChatInput) {
          interaction = new ChatInputCommandInteraction(res, req.body, client);
        } else if (req.body.data.type === ApplicationCommandType.Message) {
          interaction = new MessageContextMenuCommandInteraction(
            res,
            req.body,
            client
          );
        } else {
          interaction = new UserContextMenuCommandInteraction(
            res,
            req.body,
            client
          );
        }
        break;
      }
      case InteractionType.ApplicationCommandAutocomplete: {
        interaction = new AutocompleteInteraction(res, req.body, client);
        break;
      }
      case InteractionType.MessageComponent: {
        if (req.body.data.component_type === ComponentType.SelectMenu) {
          interaction = new SelectMenuInteraction(res, req.body, client);
          break;
        } else if (req.body.data.component_type === ComponentType.Button) {
          interaction = new ButtonInteraction(res, req.body, client);
          break;
        }
      }
      case InteractionType.ModalSubmit: {
        interaction = new ModalSubmitInteraction(res, req.body, client);
        break;
      }
      default: {
        interaction = new Interaction(res, req.body, client);
        break;
      }
    }
    await client.channels.fetch(interaction.channelId);
    if (interaction.guildId) {
      interaction.guild = await client.guilds.fetch(interaction.guildId);
      interaction.member = new Member(req.body.member, interaction.guild);
    }
    interaction.reply({
      content: (
        Date.now() - DiscordSnowflake.timestampFrom(req.body.id)
      ).toString(),
    });
  }
);

app.listen(3000, () => console.log("seeya"));
client.loginWithoutFetching(process.env.token);
