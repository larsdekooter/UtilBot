import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { SlashCommandBuilder } from "@discordjs/builders";
import "dotenv/config";
const rest = new REST().setToken(process.env.token);

rest
  .put(
    Routes.applicationGuildCommands("986610393843642388", "950680035411501056"),
    {
      body: [
        new SlashCommandBuilder()
          .setName("response-time")
          .setDescription("Response Time"),
        new SlashCommandBuilder()
          .setName("clear")
          .setDescription("clears the channel"),
        new SlashCommandBuilder()
          .setName("eval")
          .setDescription("eval")
          .addStringOption((o) =>
            o.setName("input").setDescription("input").setRequired(true)
          ),
        new SlashCommandBuilder()
          .setName("bitfield")
          .setDescription("Bietfields")
          .addSubcommand((o) =>
            o
              .setName("permissions")
              .setDescription("Destructure Permissions Bitfield")
              .addStringOption((x) =>
                x
                  .setName("bitfield")
                  .setDescription("The bitfield to destructure")
                  .setRequired(true)
              )
          )
          .addSubcommand((o) =>
            o
              .setName("intents")
              .setDescription("Destructure Intents Bitfield")
              .addStringOption((x) =>
                x
                  .setName("bitfield")
                  .setDescription("The bitfield to destructure")
                  .setRequired(true)
              )
          ),
        new SlashCommandBuilder()
          .setName("snowflake")
          .setDescription("Snowflake")
          .addStringOption((o) =>
            o
              .setName("snowflake")
              .setDescription("The snowflake to inspect")
              .setRequired(true)
          ),
        new SlashCommandBuilder()
          .setName("userinfo")
          .setDescription("User")
          .addUserOption((o) =>
            o
              .setName("user")
              .setDescription("The User to inspect")
              .setRequired(true)
          ),
        new SlashCommandBuilder()
          .setName("ban")
          .setDescription("Ban a user")
          .addStringOption((o) =>
            o
              .setName("user")
              .setDescription("The user to ban")
              .setRequired(true)
          ),
        new SlashCommandBuilder()
          .setName("ping")
          .setDescription("Replies with Pong!")
          .addStringOption((o) =>
            o
              .setName("string")
              .setDescription("string")
              .setRequired(true)
              .setAutocomplete(true)
          ),
      ],
    }
  )
  .then(console.log("hello"));
