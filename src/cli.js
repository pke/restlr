#!/usr/bin/env node

// eslint-disable-next-line node/shebang
const { prompt } = require("enquirer")
const handleRequestAction = require("./handleRequestAction")
const resourcePrompt = require("./prompts/resourcePrompt")

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

// Using a single function to handle multiple signals
// Using a single function to handle multiple signals
function handle(signal) {
  console.log(`Received ${signal}`)
}

// https://pastebin.com/raw/B7KHJL4r

function isCancel(e) {
  return e === ""
}

process.on("exit", (code) => {
  console.log(`About to exit with code: ${code}`)
});

(async () => {
  let action = {
    request: {
      href: "http://localhost:3000" // "https://restlr.net/discover.json" //"https://api.github.com/users/pke/repos" "https://api.github.com/repos/pke/acts_as_bookable/forks"
    }
  }

  if (!process.stdin.isTTY) {
    process.stdin.resume()
    
    process.on("SIGPIPE", handle)
    process.on("SIGINT", handle)
    process.on("SIGTERM", handle)

    process.stdin.setEncoding("utf8")
    
    const json = await new Promise((resolve, reject) => {
      var data = ""
      process.stdin.on("data", function(chunk) {
        data += chunk
      })  
      process.stdin.on("end", () => {
        console.log("INCOMING: " + data)
        resolve(JSON.parse(data))
      })
      process.stdin.on("error", reject)
    })
    
    action = {
      prompt: resourcePrompt(json)
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
        // eslint-disable-next-line no-unused-vars
        const { request, prompt } = action
        // You can inspect the action or its already destructured `request` and
        // `prompt` members to see what might have lead to the error
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
  console.log("no more actions")
})()
