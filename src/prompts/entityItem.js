const title = require("../title")

module.exports = function entityItem(item) {
  return {
    message: title(item, "entity"),
    choices: (item.entities || []).map(entityItem),
    result() {
      if (item.href) {
        return {
          request: {
            href: item.href
          }
        }
      } else {
        const resourcePrompt = require("./resourcePrompt")
        return {
          prompt: resourcePrompt(item)
        }
      }
    }
  }
}
