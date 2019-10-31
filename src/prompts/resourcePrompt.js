const noEmptyArray = require("../noEmptyArray")
const linkItem = require("./linkItem")
const partChoices = require("../partChoices")

module.exports = (resource, location) => ({
  type: "select",
  name: "result",
  choices: noEmptyArray(
    partChoices(resource, "actions"),
    partChoices(resource, "links"),
    partChoices(resource, "entities"),
    location && linkItem({
      title: "Location",
      href:location
    })
  ),
  result() {
    return this.selected.result()
  }
})
