const noEmptyArray = require("../noEmptyArray")
const linkItem = require("./linkItem")
const partChoices = require("../partChoices")

module.exports = (resource, location, request) => ({
  type: "select",
  choices: noEmptyArray(
    partChoices(resource, "actions"),
    partChoices(resource, "links"),
    partChoices(resource, "entities"),
    location && linkItem({
      title: "Location",
      href:location
    }),
    {
      role: "separator"
    },
    request && {
      title: "refresh",
      result() {
        return {
          request
        }
      }
    }/*,
    {
      title: "back",
      result() {
        return { back: true }
      }
    }*/
  ),
  result() {
    return this.selected.result()
  }
})
