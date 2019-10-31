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

(async () => {
  let request = client.get("http://htpc:1337/hywit/void"/*"https://pastebin.com/raw/B7KHJL4r"*/)
  let nextPrompt = await requestToPrompt(request)

  do {
    try {
      const next = await nextPrompt
      if (next.request) {
        const { method, href, form } = next.request
        nextPrompt = requestToPrompt(client[method.toLowerCase()](href, {
          form
        }))
      } else if (next.prompt) {
        nextPrompt = next.prompt
      }
    } catch (e) {
      console.error(e)
      // Have no idea how to recover from errors for now
      // Going back one prompt or redoing an action?
      break
    }
  }while (nextPrompt)
})()
