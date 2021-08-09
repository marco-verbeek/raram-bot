const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { champ_icon_or_random, random_rank_icon } = require('../../utils/champion_icons')

const axios = require('axios')
const commands = require('../../data/commands.json')

function create_error_embed(title, description){
  const embed = new MessageEmbed()
  .setAuthor(title)
  .setDescription(description)
  .setColor(0xFF0000)

  return embed;
}

async function command_analyse_last_game(msg) {
  const profileReq = await axios.get('http://localhost:3000/accounts/' + msg.author.id)
  const profile = profileReq.data

  if(profile === undefined || !profile.verified){
    const embed = create_error_embed(
      "You do not have a rARAM account, or you haven't verified it yet.",
      "Use `!raram verify <summonerName>` to verify your account."
    )

    return msg.embed(embed)
  }

  const lastMatchReq = await axios.get('http://localhost:3000/accounts/'  + msg.author.id + '/lastgame')
  const lastMatch = lastMatchReq.data

  if(lastMatch.error !== undefined){
    const embed = create_error_embed("An error occured during rARAM's fetching of your last played ARAM.", "Error: "+lastMatch.error)

    return msg.embed(embed)
  }

  return command_analyse(msg, lastMatch.matchId, profile.encryptedAccountId)
}

/**
 * Displays an analysis of the league game with provided ID. Only displays the team to which summonerId belongs.
 * @param {CommandoMessage} message - The message the command is being run for
 */
async function command_analyse(msg, gameId, accountId) {
  try {
    const res = await axios.get('http://localhost:3000/analyses/' + gameId)
    const players = res["data"]["players"]

    const playerTeamId = players.find((player) => player.accountId === accountId).teamId

    const startIndex = playerTeamId === 100 ? 0 : 5;
    const endIndex = playerTeamId === 100 ? 5 : 10;

    let col1 = "", col2 = "", col3 = ""

    // TODO: this needs to be cleaned up and finished.
    for (var i = startIndex; i < endIndex; i++) {
      col1 += champ_icon_or_random(players[i]["champion"]) + " | " +
        players[i]["summonerName"] + "\n";
      col2 += `[${players[i]["kills"]}/${players[i]["deaths"]}/${players[i]["assists"]}](${msg.url} "Damage Done: 12245\nDamage Taken: 32422 \nHealed: 1200")` +
        "\n";
      col3 += random_rank_icon() + " (" +
        (players[i]["lpGain"] >= 0 ? "+" : "") + players[i]["lpGain"] + ")\n";
    }

    const embed = new MessageEmbed().setAuthor("Here are your rARAM stats from your last played ARAM:").
      setColor(0x009FFF).
      addField("Player", col1, true).
      addField("K/D/A", col2, true).
      addField("Rank", col3, true).
      setFooter("Rank is only displayed for players in a rARAM queue.")

    return msg.embed(embed);
  } catch (e) {
    const embed = create_error_embed("An error occured: rARAM could not find the game with specified id.", "Are you sure this is an existing ARAM game?")
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
 * Verifies the player's League identity, by asking the user to input a uuid in his official League client.
 * @param {CommandoMessage} message - The message the command is being run for
 * @param accountName the player's account/summoner name
 * @param region the player's account region
 */
async function command_verify(msg, accountName = "", region = 'EUW'){
  try {
    const verifyReq = await axios.get('http://localhost:3000/accounts/verify/' + msg.author.id + "/" + accountName)
    const account = verifyReq.data

    // No account has been found: please specify a summonerName.
    if(account.error !== undefined){
      const embed = new MessageEmbed()
      .setAuthor("An error occured: " + account.error)
      .setDescription("Please use `!raram verify <summonerName>` first.")
      .setColor(0x009FFF)

      return msg.embed(embed)
    }

    // account exists and is verified. Thank you for using rARAM!
    if (account.verified) {
      const embed = new MessageEmbed().setAuthor("Your account " + account.summonerName + " (" + region.toUpperCase() + ") is verified.")
        .setDescription("Have fun using rARAM!")
        .setColor(0x00FF00)

      return msg.embed(embed);
    }

    // account exists but has yet to be verified.
    const embed = new MessageEmbed()
      .setAuthor("Attempting to verify account " + account.summonerName + " (" + region.toUpperCase() + ").")
      .setDescription("Please save `" + account.uuid + "` in the League Client.\nThen, use `!raram verify`.")
      .setColor(0x009FFF)

    return msg.embed(embed)
  } catch (e) {
    const embed = create_error_embed("An error occured: rARAM could not find the Summoner with specified name.", "Please use `!raram verify <summonerName>`.")
    return msg.embed(embed);
  }
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
        return command_analyse_last_game(msg)
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