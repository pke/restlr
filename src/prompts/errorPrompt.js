const inDebugMode = require("../inDebugMode")
const noEmptyArray = require("../noEmptyArray")

module.exports = function errorPrompt(error, action) {
  return {
    prompt: {
      type: "select",
      message: error.message,
      initial: "retry",
      choices: noEmptyArray(
        { name: "retry", message: "Retry" },
        inDebugMode && { name: "debug", message: "Break into Debugger" },
        { name: "quit", message: "Quit" }
      ),
      result(value) {
        if (value === "retry") {
          return action
        }
        if (value === "debug") {
          return {
            debug: action
          }
        }
        return {
          quit: true
        }
      }
    }
  }
}
