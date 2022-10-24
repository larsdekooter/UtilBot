import express from "express";
import path, { dirname } from "path";
import {
  BitField,
  Client,
  GatewayIntentBits,
  IntentsBitfield,
  InteractionType,
  PermissionFlagsBits,
  PermissionsBitField,
  Routes,
} from "kooterdiscordstructures";
import { fileURLToPath } from "url";
import "dotenv/config";
import { inspect } from "util";
import {
  EmbedBuilder,
  inlineCode,
  codeBlock,
  ActionRowBuilder,
  SelectMenuBuilder,
} from "@discordjs/builders";
import kleur from "kleur";
import { DiscordSnowflake } from "@sapphire/snowflake";
import fetch from "node-fetch";
import { InteractionResponseType } from "discord-api-types/v10";

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

const validators = [
  {
    predicate: async (rest, snowflake) => {
      try {
        await rest.get(Routes.channel(snowflake));
        return true;
      } catch (error_) {
        const error = error_;
        return error.code === 50_001;
      }
    },
    type: "Channel",
  },
  {
    predicate: async (rest, snowflake) => {
      try {
        await rest.get(Routes.guildAuditLog(snowflake));
        return true;
      } catch (error_) {
        const error = error_;
        return error.code === 50_013;
      }
    },
    type: "Guild",
  },
  {
    predicate: async (rest, snowflake) => {
      try {
        await rest.get(Routes.webhook(snowflake));
        return true;
      } catch (error_) {
        const error = error_;
        return error.code === 50_013;
      }
    },
    type: "Webhook",
  },
  {
    predicate: async (rest, snowflake) => {
      try {
        await rest.get(Routes.sticker(snowflake));
        return true;
      } catch {
        return false;
      }
    },
    type: "Sticker",
  },
  {
    predicate: async (rest, snowflake) => {
      try {
        const res = await fetch(rest.cdn.emoji(snowflake, "png"));
        return res.ok;
      } catch {
        return false;
      }
    },
    type: "Emoji",
  },
  {
    predicate: async (rest, snowflake) => {
      try {
        await rest.get(Routes.user(snowflake));
        return true;
      } catch {
        return false;
      }
    },
    type: "User",
  },
];

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
      /*await interaction.reply({
        content: (Date.now() - interaction.createdTimestamp).toString(),
        ephemeral: true,
      });*/
      await interaction.deferReply();
      await interaction.editReply({ content: "test" });
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
        if (error.message === "Error: Received one or more errors")
          console.error(error);
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
    } else if (interaction.commandName === "bitfield") {
      if (interaction.options.getSubCommand() === "permissions") {
        const bitProducer = (key) => PermissionFlagsBits[key];
        const bits = new PermissionsBitField(
          interaction.options.getString("bitfield")
        );
        const content = codeBlock(
          "ansi",
          formatBits(bitProducer, bits, "Permissions Bitfield")
        );
        await interaction.reply({ content, ephemeral: true });
      } else if (interaction.options.getSubCommand() === "intents") {
        const bitProducer = (key) => GatewayIntentBits[key];
        const bits = new IntentsBitfield(
          interaction.options.getString("bitfield")
        );
        const content = codeBlock(
          "ansi",
          formatBits(bitProducer, bits, "Intents Bitfield")
        );
        await interaction.reply({ content, ephemeral: true });
      }
    } else if (interaction.commandName === "snowflake") {
      await interaction.deferReply({ ephemeral: true });
      const snowflake = interaction.options.getString("snowflake");
      async function findTypes() {
        for (const validator of validators) {
          const t = await validator.predicate(client.rest, snowflake);
          if (t) {
            return validator.type;
          }
        }
      }

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `Snowflake: ${snowflake}\nTimestamp: <t:${Math.round(
                DiscordSnowflake.timestampFrom(snowflake) / 1000
              )}:F>\nType: ${await findTypes()}`
            )
            .setColor(0x2f3136),
        ],
        ephemeral: true,
      });
    } else if (interaction.commandName === "userinfo") {
      await interaction.deferReply();
      const user = await client.users.fetch(
        interaction.options.getUser("user")?.id
      );
      const member = await interaction.guild.members.fetch(
        interaction.options.getMember("user")?.id
      );
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("User info")
            .setDescription(
              `\u2022 Name: ${user.toString()} \`${
                user.tag
              }\`\n\u2022 ID: ${inlineCode(
                user.id
              )}\n\u2022 Created: <t:${Math.round(
                DiscordSnowflake.timestampFrom(user.id) / 1000
              )}:f>\n\u2022 Avatar: [${
                user.avatar
              }](${user.avatarURL()})\n\n**Member info**\n\u2022 Joined: <t:${Math.round(
                member.joinedAt.getTime() / 1000
              )}:f>`
            ),
        ],
        ephemeral: true,
      });
      interaction.end();
    } else if (interaction.commandName === "ban") {
      const user = interaction.options.getUser("user");
      await interaction.guild.bans.create(user.id, { deleteMessageDays: 7 });
      return await interaction.reply(`Banned ${user}`);
    } else if (interaction.commandName === "ping") {
      await interaction.reply("Pong!");
      await interaction.followUp("Pong again!");
    }
  }
});
app.listen(3000, () => console.log("seeya"));
client.login(process.env.token);

function formatBits(bitProducer, bits, heading) {
  const entries = [];
  for (const [key, val] of Object.entries(bits.serialize())) {
    if (Number.isNaN(Number.parseInt(key, 10))) {
      // console.log(IntentsBitfield[key]);
      entries.push({
        bit: bitProducer(key),
        name: key,
        represented: val,
      });
    }
  }
  return [
    kleur.white(`${heading} deconstruction of bitfiled ${bits.bitfield}`),
    ...entries.map(
      (entry, index) =>
        `${entry.represented ? kleur.green("[✔]") : kleur.red("[✖]")} ${
          entry.name
        } (${entry.bit}) 1 << ${index}`
    ),
  ].join("\n");
}
