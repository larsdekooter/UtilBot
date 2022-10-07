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

const client = new Client(app, {
  clientPublicKey:
    "d8c09e3ffb1c254322b098b64801f519d5401b07feccc272954739fb81c6f49a",
  route: "/inter",
});

app.get("/", (req, res) =>
  res.sendFile("index.html", { root: path.join(__dirname, "Public") })
);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "grav") {
    // await interaction.channel?.bulkDelete(100, true).catch(console.log);
    await interaction.reply("Cleared");
  }
});

client.on("ready", async () => {
  console.log("Client is Ready");
});

client.rest.on("response", (req, res) => console.log(res.statusCode));

app.listen(3000, () => console.log("seeya"));
client.loginWithoutFetching(process.env.token);
