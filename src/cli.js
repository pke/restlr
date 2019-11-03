#!/usr/bin/env node

// eslint-disable-next-line node/shebang
const { prompt } = require("enquirer")
const handleRequestAction = require("./handleRequestAction")

const cpromise = (promise, defaultResult) => {
  let outerReject

  const wrappedPromise = new Promise((resolve, reject) => {
    outerReject = reject
    Promise.resolve(promise).then(resolve).catch(reject)
  })

  wrappedPromise.cancel = (reason) => {
    outerReject(reason || defaultResult || new Error("Cancelled"))
  }

  return wrappedPromise
}


// https://pastebin.com/raw/B7KHJL4r

function isCancel(e) {
  return e === ""
}

(async () => {
  let action = {
    request: {
      href: "https://restlr.net/discover.json" //"https://api.github.com/users/pke/repos" "https://api.github.com/repos/pke/acts_as_bookable/forks"
    }
  }

  do {
    try {
      if (action.request) {
        action = await handleRequestAction(action.request)
      } else if (action.prompt) {
        const { nextAction } = await prompt({
          ...action.prompt,
          name: "nextAction",
        })
        action = nextAction
      } else if (action.quit) {
        action = null
      } else if (action.back) {
        throw ""
      } else if (action.debug) {
        // Retry the erroneous action by default
        action = action.debug
        // eslint-disable-next-line no-debugger
        debugger
        continue
      } else {
        // eslint-disable-next-line no-debugger
        debugger
      }
    } catch (e) {
      /*if (isCancel(e)) {
        const nextAction = history.pop()
        action = nextAction
      } else*/ {
        const errorPrompt = require("./prompts/errorPrompt")
        action = errorPrompt(e, action)
      }
    }
  }while (action)
})()
