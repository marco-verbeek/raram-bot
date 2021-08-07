const Commando = require('discord.js-commando');
const path = require('path');
require('dotenv').config()

const client = new Commando.Client({
  owner: process.env.DISCORD_OWNER_ID,
  commandPrefix: '!',
  disableEveryone: true
});

client.once('ready', () => {
  console.log("Beep boop. Bot ready!")
})

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['raram', 'Commands related to rARAM'],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    help: false,
    prefix: false,
    ping: true,
    eval: true,
    unknownCommand: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(process.env.DISCORD_TOKEN)