import express from "express";
import path, { dirname } from "path";
import {
  AttachmentBuilder,
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
  ModalBuilder,
  TextInputBuilder,
} from "@discordjs/builders";
import kleur from "kleur";
import { DiscordSnowflake } from "@sapphire/snowflake";
import fetch from "node-fetch";
import { InteractionResponseType, TextInputStyle } from "discord-api-types/v10";
kleur.enabled = true;

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
      // /*await interaction.reply({
      //   content: (Date.now() - interaction.createdTimestamp).toString(),
      //   ephemeral: true,
      // });*/
      return interaction.end();
    } else if (interaction.commandName === "clear") {
      await interaction.channel.bulkDelete(100, true);
      await interaction.reply({
        content: "clearage succesfull",
        ephemeral: true,
      });
      return interaction.end();
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
        return interaction.end();
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
        return interaction.end();
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
        return interaction.end();
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
        return interaction.end();
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
      return interaction.end();
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
      return interaction.end();
    } else if (interaction.commandName === "ban") {
      const user = interaction.options.getUser("user");
      await interaction.guild.bans.create(user.id, { deleteMessageDays: 7 });
      await interaction.reply(`Banned ${user}`);
      interaction.end();
    } else if (interaction.commandName === "ping") {
      // Create the modal
      const modal = new ModalBuilder()
        .setCustomId("myModal")
        .setTitle("My Modal");

      // Create the text components
      const animalInput = new TextInputBuilder()
        .setCustomId("favoriteAnimalInput")
        // The label is what the user sees for this input
        .setLabel("What is your favorite animal?")
        // Short means only a single line of text
        .setStyle(TextInputStyle.Short);

      const hobbiesInput = new TextInputBuilder()
        .setCustomId("hobbiesInput")
        .setLabel("What are some of your favorite hobbies?")
        // Paragraph means multiple lines of text
        .setStyle(TextInputStyle.Paragraph);

      // An action row can only hold one input, so you need one action row per input
      const firstActionRow = new ActionRowBuilder().addComponents(animalInput);
      const secondActionRow = new ActionRowBuilder().addComponents(
        hobbiesInput
      );

      // Add the inputs to the modal
      modal.addComponents(firstActionRow, secondActionRow);

      // Show the modal to the user
      await interaction.showModal(modal);
      return interaction.end();
    }
  }
  if (interaction.isAutocomplete()) {
    console.log(global.require);
    const value = interaction.options.getFocused();
    if (value.includes(".")) {
      // Get the main accessor
      const mainProperty = Object.getOwnPropertyNames(global).find(
        (prop) => prop === value.split(".")[0]
      );
      // If there is no main property found, end the interaction and show nothing to the user
      if (!mainProperty) {
        await interaction.respond([]);
        return interaction.end();
      }
      // Get all the individual properties, and remove the .'s
      /**
       * @type string[]
       */
      const accessors = value.split(".");
      let obj = global;
      let data = "";
      /**
       * @type string[]
       */
      let returnValue;
      const isValid = accessors.every((a, index) => {
        // Make sure it is not the last element of the array, so it wont show all the options of the the properties beforehand
        if (typeof accessors[index + 1] !== "undefined") {
          // If the property exists, change the obj and add the data to the return string.
          if (Object.getOwnPropertyNames(obj).includes(a)) {
            obj = obj[a];
            data.length === 0 ? (data += `${a}`) : (data += `.${a}`);
            return true;
          }
          // If it isnt valid, return false
          return false;
        }
        // Get all the properties from the final object
        returnValue = Object.getOwnPropertyNames(obj).filter((prop) =>
          prop.toLowerCase().startsWith(a.toLowerCase())
        );
        return true;
      });
      // If it is valid, show all the options to the user
      if (isValid) {
        await interaction.respond(
          returnValue
            .map((val) => ({
              name: `${data}.${val}`,
              value: `${data}.${val}`,
            }))
            // Limit the array to 25
            .slice(0, 25)
        );
        return interaction.end();
      }
      // If it isnt valid, show nothing
      await interaction.respond([]);
      return interaction.end();
    } else {
      // Get all the properties from the global scope
      const properties = Object.getOwnPropertyNames(global);
      // Filter the properties that don't start with the entered value
      const values = properties
        .filter((prop) => prop.toLowerCase().startsWith(value.toLowerCase()))
        // Limit the array to 25
        .slice(0, 25)
        // Make it suitable for the response
        .map((prop) => ({ value: prop, name: prop }));
      // Show the items to the user
      await interaction.respond(values);
      return interaction.end();
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
