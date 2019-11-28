const countItems = require("./countItems")
const mapItems = require("./mapItems")
const actionItem = require("./prompts/actionItem")
const entityItem = require("./prompts/entityItem")
const linkItem = require("./prompts/linkItem")

function choiceItem(part, item) {
  switch (part) {
  case "actions": return actionItem(item)
  case "links": return linkItem(item)
  case "entities": return entityItem(item)
  }
}

module.exports = function partChoices(response, part) {
  const items = response[part]
  const count = countItems(items)
  if (count) {
    return {
      name: part,
      role: "separator",
      message: `${part} (${count})`,
      choices: mapItems(items, choiceItem.bind(this, part))
    }
  } else {
    return {
      name: part,
      value: part,
      disabled: true
    }
  }
}
