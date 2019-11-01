#!/usr/bin/env node

// eslint-disable-next-line node/shebang
const { prompt } = require("enquirer")
const got = require("got")
const ora = require("ora")
const chalk = require("chalk")

const waitp = require("../waitp")
const inDebugMode = require("./inDebugMode")
const noEmptyArray = require("./noEmptyArray")
const mapItems = require("./mapItems")
const resourcePrompt = require("./prompts/resourcePrompt")
const fixLocalhostLinks = require("./fixLocalhostLinks")

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


function fixLocationHeader(response) {
  if (response.headers.location) {
    const host = response.req.getHeader("host")
    response.headers.location = fixLocalhostLinks(host, response.headers.location)
  }
  return response
}

const client = got.extend({
  hooks: {
    beforeRequest: [
      options => {
        // We want to have total control over redirects
        options.followRedirect = false
        options.headers["Accept"] = "application/vnd.siren+json"
      }
    ],
    beforeRedirect: [
      (options, response) => {
        fixLocationHeader(response)
        options.href = response.headers.location
      }
    ],
    afterResponse: [
      fixLocationHeader,
      (response) => {
        const host = response.req.getHeader("host")
        if (response.body) {
          response.body = fixLocalhostLinks(host, response.body)
        }
        return response
      }
    ]
  },
  mutableDefaults: true
})

async function requestToPrompt(request) {
  const { method = "get", href, form } = request
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
      const json = JSON.parse(response.body || "{}")
      console.log(mapItems(json.properties || {}, (value, key) => `${key}: ${value}`).join("\n"))
      return {
        prompt: resourcePrompt(json, response.headers.location)
      }
    }
  } catch (e) {
    spinner.fail(e.message)
    throw e
  }
}

const errorPrompt = (error, action) => ({
  prompt: {
    type: "select",
    name: "nextAction",
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
})

// https://pastebin.com/raw/B7KHJL4r

//prompt.on("cancel", process.exit.bind(this, 0))

;(async () => {
  let action = {
    request: {
      href: "https://pastebin.com/raw/C9TTYxHT"// "http://htpc:1337/hywit/void"
    }
  }

  do {
    try {
      if (action.request) {
        /*if (!nextPrompt) {
          throw new Error("Connection refused")
        }*/
        action = await requestToPrompt(action.request)
      } else if (action.prompt) {
        const { nextAction } = await prompt({
          ...action.prompt,
          name: "nextAction",
        })
        action = nextAction
      } else if (action.quit) {
        action = null
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
      action = errorPrompt(e, action)
    }
  }while (action)
})()
