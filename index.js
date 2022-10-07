import express from "express";
import path, { dirname } from "path";
import { Client } from "kooterdiscordstructures";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static("Public"));

let latestCode;
function parseHeader(header) {
  if (header === void 0 || typeof header === "string") {
    return header;
  }
  return header.join(";");
}
async function parseResponse(res) {
  const header = parseHeader(res.headers["content-type"]);
  if (header?.startsWith("application/json")) {
    return res.body.json();
  }
  return res.body.arrayBuffer();
}

const client = new Client(app, {
  clientPublicKey:
    "d8c09e3ffb1c254322b098b64801f519d5401b07feccc272954739fb81c6f49a",
  route: "/inter",
});

app.get("/", (req, res) =>
  res.sendFile("index.html", { root: path.join(__dirname, "Public") })
);

client.on("interactionCreate", async (interaction) => {
  console.log(latestCode);
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "grav") {
    await interaction.reply("Cleared");
  }
});

client.on("ready", async () => {
  throw new Error("Client is ready");
});

client.rest.on("response", (req, res) => (latestCode = res.body.json()));

app.listen(3000, () => console.log("seeya"));
client.loginWithoutFetching(process.env.token);
