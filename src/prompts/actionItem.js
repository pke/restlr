const { prompt } = require("enquirer")

const visitItems = require("../visitItems")
const fieldItem = require("./fieldItem")

const actionRequest = (action, formValues) => ({
  method: action.method,
  href: action.href,
  form: formValues
})

const actionPrompt = action => {
  console.log(JSON.stringify(action, null, 2))
  return {
    type: "form",
    name: "request",
    message: action.title || action.name,
    choices: visitItems("filter", action.fields, item => item.type !== "hidden").map(fieldItem),
    result(values) {
      return actionRequest(action, values)
    }
  }
}

module.exports = function actionItem(action) {
  return {
    name: action.name,
    message: action.title || action.name,
    result() {
      if (action.fields && action.fields.length > 0) {
        return {
          prompt: actionPrompt(action)
        }
      } else {
        return {
          request: actionRequest(action)
        }
      }
    }
  }
}
