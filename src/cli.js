#!/usr/bin/env node

// eslint-disable-next-line node/shebang
const { prompt } = require("enquirer")
const ora = require("ora")

const mapItems = require("./mapItems")
const resourcePrompt = require("./prompts/resourcePrompt")
const client = require("./client/client")

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

const handlers = [
  {
    test: {
      "content-type": "application/json",
      "x-github-media-type": "github.v3; format=json"
    },
    handle(response) {
      const { handleResponse } = require("../restlr-plugin-github")
      return handleResponse(response)
    }
  }
]

function transformResponse(headers) {
  for (let i=0; i<handlers.length; ++i) {
    const handler = handlers[i]
    if (Object.keys(handler.test).every(header => {
      const value = headers[header] || ""
      return value.match(handler.test[header])
    })) {
      return handler.handle
    }
  }

  return (response) => response
}

async function handleRequestAction(request) {
  const { method = "get", href, form, type } = request
  const spinnerText = `${method.toUpperCase()} ${href}...`
  const spinner = ora(spinnerText).start()
  /*const stillTrying = cpromise(
    waitp(3000,
      spinnerText + " Still trying",
      "yellow")
      .then(([text, color]) => {
        spinner.color = color
        spinner.text = chalk[color](text)
      }).catch(() => {})
  )*/
  try {
    //await waitp(5000)
    const response = await client[method.toLowerCase()](href, {
      headers: {
        "accept": type
      },
      form
    })
    //stillTrying.cancel()
    spinner.succeed(`${method.toUpperCase()} ${href} ${response.statusCode} ${response.statusMessage}`)
    //console.log(response.headers["content-type"])
    if (response.statusCode === 201) {
      return {
        request: {
          href: response.headers.location
        }
      }
    } else {
      const json = transformResponse(response.headers)(JSON.parse(response.body || "{}"))
      console.log(mapItems(json.properties || {}, (value, key) => `${key}: ${value}`).join("\n"))
      return {
        prompt: resourcePrompt(json, response.headers.location, request)
      }
    }
  } catch (e) {
    spinner.fail(e.message)
    throw e
  }
}

// https://pastebin.com/raw/B7KHJL4r

function isCancel(e) {
  return e === ""
}

(async () => {
  let action = {
    request: {
      href: "https://restlr.net/discover.json" //"https://api.github.com/repos/pke/acts_as_bookable/forks" // "https://api.github.com/users/pke/repos"
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
