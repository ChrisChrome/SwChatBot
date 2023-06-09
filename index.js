const config = require("./config.json");
const colors = require("colors");
const axios = require("axios");

// Setup Discord
const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["GuildMessages", "MessageContent", "Guilds", "GuildMembers"]})

// Setup Webhook
const webhook = new Discord.WebhookClient({url: config.discord.webhook}, {allowedMentions: {parse: []}});

// Setup Discord Stuff
client.on("ready", () => {
	console.log(`${colors.cyan("[INFO]")} Logged In As ${client.user.tag}!`);
	// start express server
	app.listen(config.port, () => {
		console.log(`${colors.cyan("[INFO]")} Started Express Server On Port ${config.port}!`);
		console.log(`${colors.cyan("[INFO]")} Startup Took ${new Date() - startTime}ms!`);
	});
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	if (message.channel.type === "DM") return;
	if (message.channel.id !== config.discord.channel) return;
	if (message.content.length == 0) return;
	msgBuffer.push({
		name: message.author.username,
		msg: message.content,
	});
});

// Setup Express
const express = require("express");
const app = express();

// Setup Routes
app.get("/send/:data", async (req, res) => {
	console.log(req.params.data);
	const data = JSON.parse(decodeURIComponent(req.params.data));
	if (data.password !== config.password) return res.sendStatus(403);
	console.log(data.sid)
	await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steamkey}&steamids=${data.sid}`).then((response) => {
		console.log(response.data)
		webhook.send({
			isUser: true,
			username: data.name,
			content: data.msg,
			avatarURL: response.data.response.players[0].avatarfull
		})
	});
	res.sendStatus(204);
});

app.get("/sendsystem/:data", async (req, res) => {
	const data = JSON.parse(decodeURIComponent(req.params.data));
	if (data.password !== config.password) return res.sendStatus(403);
	webhook.send({
		isUser: false,
		username: data.name,
		content: data.msg
	});
	res.sendStatus(204);
});

app.get("/get/:password", (req, res) => {
	if (req.params.password !== config.password) return res.sendStatus(403);
	res.send(msgBuffer);
	msgBuffer = [];
});

var msgBuffer = [];

const startTime = new Date();
console.log(`${colors.cyan("[INFO]")} Starting Up...`);
client.login(config.discord.token)