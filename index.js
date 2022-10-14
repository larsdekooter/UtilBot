import express from "express";
import path, { dirname } from "path";
import { Client, InteractionType } from "kooterdiscordstructures";
import { fileURLToPath } from "url";
import "dotenv/config";
import { inspect } from "util";
import { EmbedBuilder, inlineCode, codeBlock } from "@discordjs/builders";

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
  const channel = client.channels.cache.get("982551387827224636");
  if (!interaction.isAutocomplete()) {
    if (!channel?.isTextBased()) return;
    (await channel.webhooks.fetchSingle("1027229480340693084")).send({
      content: `Recieved an interaction of type ${
        InteractionType[interaction.type]
      } in ${interaction.channel} from ${interaction.user}`,
      allowedMentions: { users: [] },
    });
  }
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "response-time") {
      await interaction.reply({
        content: (Date.now() - interaction.createdTimestamp).toString(),
        ephemeral: true,
      });
    } else if (interaction.commandName === "clear") {
      await interaction.channel.bulkDelete(100, true);
      await interaction.reply({
        content: "clearage succesfull",
        ephemeral: true,
      });
    } else if (interaction.commandName === "eval") {
      const input = interaction.options.getString("input");
      try {
        let code = await eval(input);
        code = inspect(code);
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder().setTitle("eval").addFields(
              {
                name: "**Input**",
                value: codeBlock("js", input),
              },
              {
                name: "**Output**",
                value: codeBlock("js", code),
              }
            ),
          ],
        });
      } catch (error) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder().setTitle("eval").addFields(
              {
                name: "**Input**",
                value: codeBlock("js", input),
              },
              {
                name: "**Error**",
                value: codeBlock("js", error),
              }
            ),
          ],
        });
      }
    }
  }
});
app.listen(3000, () => console.log("seeya"));
client.login(process.env.token);
