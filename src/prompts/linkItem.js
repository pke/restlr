const title = require("../title")

module.exports = function linkItem(item) {
  return {
    message: title(item, "link")
  }
}
