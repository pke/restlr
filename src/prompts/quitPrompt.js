module.exports = function quitPrompt(lastAction) {
  return {
    prompt: {
      type: "confirm",
      message: "Quit?",
      result(value) {
        if (value) {
          return {
            quit: true
          }
        } else {
          return lastAction
        }
      }
    }
  }
}
