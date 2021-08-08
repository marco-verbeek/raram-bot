const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { champ_icon_or_random, random_rank_icon } = require('../../utils/champion_icons')

const axios = require('axios')
const commands = require('../../data/commands.json')

async function command_analyse_last_game(msg) {
  // axios request get player last game id
  // use last game id in command_analyse
  return command_analyse(msg, '5397055718')
}

/**
 * Displays an analysis of the league game with provided ID.
 * @param {CommandoMessage} message - The message the command is being run for
 */
async function command_analyse(msg, gameId) {
  try {
    const res = await axios.get('http://localhost:3000/analyses/' + gameId)

    const players = res["data"]["players"]
    let col1 = "", col2 = "", col3 = ""

    // TODO: this needs to be cleaned up and finished.
    for (var i = 0; i < 5; i++) {
      col1 += champ_icon_or_random(players[i]["champion"]) + " | " +
        players[i]["summonerName"] + "\n";
      col2 += `[${players[i]["kills"]}/${players[i]["deaths"]}/${players[i]["assists"]}](${msg.url} "Damage Done: 12245\nDamage Taken: 32422 \nHealed: 1200")` +
        "\n";
      col3 += random_rank_icon() + " (" +
        (players[i]["lpGain"] >= 0 ? "+" : "") + players[i]["lpGain"] + ")\n";
    }

    const embed = new MessageEmbed().setAuthor(
      "Here are your rARAM stats for your last played ARAM:",
      msg.author.displayAvatarURL()).
      setColor(0x00b3ff).
      addField("Player", col1, true).
      addField("K/D/A", col2, true).
      addField("Rank", col3, true)

    return msg.embed(embed);
  } catch (e) {
    const embed = new MessageEmbed()
      .setAuthor("An error occured. rARAM could not find the game with specified id.\nAre you sure this is an existing ARAM game?")
      .setColor(0xFF0000)

    return msg.embed(embed);
  }
}

/**
 * Displays the player's rARAM profile.
 * @param {CommandoMessage} message - The message the command is being run for
 */
function command_profile(msg){
  // axios request on endpoint /profile
  // accountName, accountRegion, totalLP
  // next: doubleKills, tripleKills, quadraKills, pentaKills, match history
  return msg.say('rARAM profile')
}

/**
 * Verifies the player's League identity, by asking the user to change his icon to a specific (free) one.
 * @param {CommandoMessage} message - The message the command is being run for
 * @param accountName the player's account/summoner name
 * @param region the player's account region
 */
function command_verify(msg, accountName, region = 'EUW'){
  // axios request on endpoint /verify/:discordId
  // returns an array of icons left to verify. if none, display "verification completed"

  return msg.say('rARAM profile verification for ' + accountName + " (" + region.toUpperCase() + ")")
}

/**
 * Starts a ranked queue of <amount> of games.
 * @param {CommandoMessage} message - The message the command is being run for
 * @param amount how many games should be added to the ranked queue
 */
function command_start(msg, amount = 1){
  // axios request on endpoint /queue/start/:amount
  // returns a message 'success'/'error' and the amount of total games in queue

  return msg.say('rARAM queue start of ' + amount + " game(s)")
}

/**
 * Stops the ranked queue.
 * @param {CommandoMessage} message - The message the command is being run for
 */
function command_stop(msg){
  // axios request on endpoint /queue/stop
  // returns a message 'success'/'error'

  return msg.say('rARAM queue stop')
}

/**
 * Adds <amount> of games to the ranked queue.
 * @param {CommandoMessage} message - The message the command is being run for
 * @param amount how many games should be added to the ranked queue
 */
function command_add(msg, amount = 1){
  // axios request on endpoint /queue/add/:amount
  // returns a message 'success'/'error' and the amount of total games in queue

  return msg.say('rARAM queue add ' + amount + ' game(s)')
}

/**
 * Removes <amount> of games from the ranked queue.
 * @param {CommandoMessage} message - The message the command is being run for
 * @param amount how many games should be removed from the ranked queue
 */
function command_remove(msg, amount = 1){
  // axios request on endpoint /queue/remove/:amount
  // returns a message 'success'/'error' and the amount of total games in queue

  return msg.say('rARAM queue remove ' + amount + ' game(s)')
}

/**
 * Sends an embed message containing all commands and their description, found in data/commands.json.
 * @param {CommandoMessage} message - The message the command is being run for
 */
function command_help(msg){
  const displayCommands = "`"+ Object.keys(commands).join("`\n`") + "`"

  const embed = new MessageEmbed()
  .setColor(0x00b3ff)
  .addField("Command", displayCommands, true)
  .addField("Description", Object.values(commands).join("\n"), true)

  return msg.embed(embed);
}

module.exports = class RaramCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'raram',
      group: 'raram',
      memberName: 'raram',
      description: 'Main RankedARAM command.',

      args: [
        {
          key: "arg",
          type: 'string',
          prompt: "",
          default: ''
        }
      ],
      argsPromptLimit: 0,
    });
  }

  async run(msg, { arg }) {
    const [mainArg, ...mainSpecific] = arg.split(" ")

    switch (mainArg) {
      case '':
        return command_analyse(msg)
      case 'analyse':
        return command_analyse(msg, mainSpecific[0])
      case 'profile':
        return command_profile(msg)
      case 'verify':
        return command_verify(msg, mainSpecific[0], mainSpecific[1])
      case 'start':
        return command_start(msg, mainSpecific[0])
      case 'stop':
        return command_stop(msg)
      case 'add':
        return command_add(msg, mainSpecific[0])
      case 'remove':
        return command_remove(msg, mainSpecific[0])
      case 'help':
        return command_help(msg)
    }

    // Unknown command.
    return command_help(msg)
  }
};