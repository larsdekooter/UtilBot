import express from "express";
import path, { dirname } from "path";
import { Client } from "kooterdiscordstructures";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static("Public"));

let route;
const client = new Client(app, {
  clientPublicKey:
    "d8c09e3ffb1c254322b098b64801f519d5401b07feccc272954739fb81c6f49a",
  route: "/inter",
});

app.get("/", (req, res) =>
  res.sendFile("index.html", { root: path.join(__dirname, "Public") })
);

client.on("interactionCreate", async (interaction) => {
  throw new Error(`${client.latestCode}, ${client.route}`);
  if (!interaction.isChatInputCommand()) return;
  if (!client.isReady) return interaction.reply("Bro I am not readyf");
  if (interaction.commandName === "grav") {
    await interaction.reply("Cleared");
  }
});

client.rest.on("response", (req, res) => (route = req.route));

app.listen(3000, () => console.log("seeya"));
client.loginWithoutFetching(process.env.token);
