const title = require("../title")

module.exports = function linkItem(item) {
  return {
    message: title(item, "link"),
    result() {
      return {
        request: {
          method: "get",
          href: item.href
        }
      }
    }
  }
}
