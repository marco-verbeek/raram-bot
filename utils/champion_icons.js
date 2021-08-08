const champ_emojis = require('../data/champ_emojis.json')
const rank_names = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Challenger"]

const random_champ_icon = () => {
  let obj_keys = Object.keys(champ_emojis);
  let ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
  return champ_emojis[ran_key]
}

exports.random_rank_icon = () => {
  let ran_rank = rank_names[Math.floor(Math.random() * rank_names.length)]
  return champ_emojis[ran_rank]
}

exports.champ_icon_or_random = (championName) => {
  championName = championName.replace(" ", "")
  return champ_emojis[championName] !== undefined ? champ_emojis[championName] : random_champ_icon()
}