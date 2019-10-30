#!/usr/bin/env node

const { prompt } = require("enquirer")
const got = require("got")

const visitItems = require("./visitItems")
const mapItems = require("./mapItems")
const countItems = require("./countItems")
const actionItem = require("./prompts/actionItem")
const linkItem = require("./prompts/linkItem")
const entityItem = require("./prompts/entityItem")
const fieldItem = require("./prompts/fieldItem")

const client = got.extend({
  hooks: {
    beforeRequest: [
      options => {
        options.headers["Accept"] = "application/vnd.siren+json"
      }
    ]
  }
})

function choiceItem(part, item) {
  switch (part) {
  case "actions": return actionItem(item)
  case "links": return linkItem(item)
  case "entities": return entityItem(item)
  }
}

function choices(response, part) {
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
      value: part
    }
  }
}

const fixHref = (response, href) => href.replace(/http:\/\/localhost:1337/gi, `http://${response.req.getHeader("host")}`)

const actionPrompt = action => prompt({
  type: "form",
  name: "action",
  message: action.title || action.name,
  choices: visitItems("filter", action.fields, item => item.type !== "hidden").map(fieldItem),
  result(value) {
    return client[action.method.toLowerCase()](action.href, {
      form: value
    })
  }
})


;(async () => {
  
  let request = client.get("http://htpc:1337/hywit/void"/*"https://pastebin.com/raw/B7KHJL4r"*/)
  let running = true

  do {
    try {
      const response = await request
      console.log(response.statusMessage)
      //console.log(response.headers["content-type"])
      if (response.statusCode === 201) {
        request = client.get(fixHref(response, response.headers.location))
      } else {
        const body = fixHref(response, response.body)
        const json = JSON.parse(body)
        console.log(mapItems(json.properties || {}, (value, key) => `${key}: ${value}`).join("\n"))
        await prompt({
          type: "select",
          choices: [
            choices(json, "actions"),
            choices(json, "links"),
            choices(json, "entities"),
          ]
        })
        const { action } = await actionPrompt(json.actions[0])
        request = action
      }
    } catch (e) {
      console.error(e)
      break
    }
  }while (running)
})()
