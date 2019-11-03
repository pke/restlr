const ora = require("ora")
const parseLinkHeader = require("parse-link-header")

const mapItems = require("./mapItems")
const resourcePrompt = require("./prompts/resourcePrompt")
const client = require("./client/client")

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
      const headerLinks = 
        Object.values(parseLinkHeader(response.headers.link) || {})
          .map(({url:href, rel}) => ({
            href,
            rel: [rel]
          }))
      json.links = (json.links || []).concat(headerLinks)
      return {
        prompt: resourcePrompt(json, response.headers.location, request)
      }
    }
  } catch (e) {
    spinner.fail(e.message)
    throw e
  }
}

module.exports = handleRequestAction
