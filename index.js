import { verifyKeyMiddleware } from "discord-interactions";
import express from "express";
import { InteractionResponseType } from "discord-api-types/v10";
class Interaction {
  data;
  constructor(interaction) {
    this.data = interaction.data;
  }
  get commandName() {
    return this.data.name;
  }
}
const app = express();
app.use(express.static("Public"));

app.get("/", (req, res) => res.sendFile("index.html", { root: "." }));
app.get(
  "/inter",
  verifyKeyMiddleware(
    "d8c09e3ffb1c254322b098b64801f519d5401b07feccc272954739fb81c6f49a"
  ),
  async (req, res) => {
    async function reply(options) {
      options =
        typeof options === "string"
          ? (options = { content: options })
          : options;
      return res.send({
        data: options,
        type: InteractionResponseType.ChannelMessageWithSource,
      });
    }
    const interaction = new Interaction(req.body);
    if (interaction.commandName === "grav") {
      return reply({ content: calculateGravity().toString() });
    }
  }
);

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
