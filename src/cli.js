#!/usr/bin/env node

// eslint-disable-next-line node/shebang
const { prompt } = require("enquirer")
const got = require("got")

const inDebugMode = require("./inDebugMode")
const noEmptyArray = require("./noEmptyArray")
const mapItems = require("./mapItems")
const resourcePrompt = require("./prompts/resourcePrompt")

const fixHref = (host, href) => (
  href.replace(/(https?):\/\/localhost(:?:\d+)?/gi, `$1://${host}`)
)

function fixLocationHeader(response) {
  if (response.headers.location) {
    const host = response.req.getHeader("host")
    response.headers.location = fixHref(host, response.headers.location)
  }
  return response
}

const client = got.extend({
  hooks: {
    beforeRequest: [
      options => {
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
          response.body = fixHref(host, response.body)
        }
        return response
      }
    ]
  },
  mutableDefaults: true
})

async function requestToPrompt(request) {
  const response = await request
  console.log(`${response.statusCode} ${response.statusMessage}`)
  //console.log(response.headers["content-type"])
  if (response.statusCode === 201) {
    return requestToPrompt(client.get(response.headers.location))
  } else {
    const json = JSON.parse(response.body || "{}")
    console.log(mapItems(json.properties || {}, (value, key) => `${key}: ${value}`).join("\n"))
    return {
      prompt: resourcePrompt(json, response.headers.location)
    }
  }
}

const errorPrompt = (error, action) => ({
  type: "select",
  name: "nextAction",
  message: error.message,
  initial: "retry",
  choices: noEmptyArray(
    { name: "retry", message: "Retry" },
    inDebugMode && { name: "debug", message: "Debug" },
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
})

// https://pastebin.com/raw/B7KHJL4r

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
        const { method = "get", href, form } = action.request
        action = await requestToPrompt(client[method.toLowerCase()](href, {
          form
        }))
      } else if (action.prompt) {
        const { nextAction } = await prompt({
          ...action.prompt,
          name: "nextAction"
        })
        action = nextAction
      } else if (action.quit) {
        action = null
      } else if (action.debug) {
        // Retry the errornous action by default
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
