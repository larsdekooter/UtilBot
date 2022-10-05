import express from "express";
import path, { dirname } from "path";
import { Client } from "kooterdiscordstructures";
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
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "grav") {
    await interaction.reply({
      content: calculateGravity().toString() + "\nFz = (G * M) / r²",
    });
  }
  const channel = client.channels.cache.get("982551387827224636");
  if (channel?.isTextBased()) {
    const webhook = await channel.webhooks.create({
      name: "UtilBot Commands Recieve",
    });
    webhook.send(webhook.id);
  }
});

function calculateGravity(
  r = 6.4e6, //6,4 * 10⁶
  G = 6.67e-11, //6,67 * 10⁻¹¹
  M = 6.0e24 //6,0 * 10²⁴
) {
  const { pow } = Math; // Get the pow function to use exponents (first parameter is the x (1), second is the y (²))
  const Fz = (G * M) / pow(r, 2); // Fz === Fg = mg === G * (mM / r²) = g ==== G * (M / r²);
  return Fz;
}

app.listen(3000, () => console.log("seeya"));
client.login(process.env.token);
