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
      ],
    }
  )
  .then(console.log("hello"));
