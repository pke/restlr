const title = require("../title")

module.exports = function entityItem(item) {
  return {
    message: title(item, "entity")
  }
}
