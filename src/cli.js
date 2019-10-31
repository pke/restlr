#!/usr/bin/env node

const { prompt } = require("enquirer")
const got = require("got")

const mapItems = require("./mapItems")
const countItems = require("./countItems")
const actionItem = require("./prompts/actionItem")
const linkItem = require("./prompts/linkItem")
const entityItem = require("./prompts/entityItem")

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

function choiceItem(part, item) {
  switch (part) {
  case "actions": return actionItem(item)
  case "links": return linkItem(item)
  case "entities": return entityItem(item)
  }
}

function partChoices(response, part) {
  const items = response[part]
  const count = countItems(items)
  if (count) {
    return {
      name: part,
      message: `${part} (${count})`,
      choices: mapItems(items, choiceItem.bind(this, part))
    }
  } else {
    return {
      name: part,
      value: part,
      disabled: true
    }
  }
}

async function requestToPrompt(request) {
  const response = await request
  console.log(`${response.statusCode} ${response.statusMessage}`)
  //console.log(response.headers["content-type"])
  if (response.statusCode === 201) {
    return requestToPrompt(client.get(response.headers.location))
  } else {
    const json = JSON.parse(response.body || "{}")
    console.log(mapItems(json.properties || {}, (value, key) => `${key}: ${value}`).join("\n"))
    const choices = [
      partChoices(json, "actions"),
      partChoices(json, "links"),
      partChoices(json, "entities"),
    ]
    response.headers.location && choices.push(
      linkItem({
        title: "Location",
        href: response.headers.location
      })
    )

    const { next } = await prompt({
      type: "select",
      name: "next",
      choices,
      result() {
        return this.selected.result()
      }
    })
    return next
  }
}

const errorPrompt = (error, action) => ({
  type: "select",
  name: "next",
  message: error.message,
  initial: "retry",
  choices: [
    { name: "retry", message: "Retry" },
    { name: "debug", message: "Debug" },
    { name: "quit", message: "Quit" }
  ],
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
      href: "http://htpc:1337/hywit/void"
    }
  }
  
  let nextPrompt
  do {
    try {
      if (action.request) {
        if (!nextPrompt) {
          throw new Error("Connection refused")
        }
        const { method = "get", href, form } = action.request
        nextPrompt = requestToPrompt(client[method.toLowerCase()](href, {
          form
        }))
      } else if (action.prompt) {
        nextPrompt = prompt(action.prompt)
      } else if (action.quit) {
        nextPrompt = null
      } else if (action.debug) {
        action = action.debug
        debugger
        continue
      }
      action = await nextPrompt
    } catch (e) {
      nextPrompt = prompt(errorPrompt(e, action))
      const { next } = await nextPrompt
      action = next
    }
  }while (nextPrompt)
})()
