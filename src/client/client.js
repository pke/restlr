const got = require("got")

const fixLocalhostLinks = require("./fixLocalhostLinks")

function fixLocationHeader(response) {
  if (response.headers.location) {
    const host = response.req.getHeader("host")
    response.headers.location = fixLocalhostLinks(host, response.headers.location)
  }
  return response
}

const package = require("../../package.json")

const determineAcceptHeader = options => {
  if (options.headers["accept"]) {
    return
  }
  if (/^https:\/\/api.github.com/.test(options.href)) {
    options.headers["accept"] = "application/vnd.github.v3+json"
  } else {
    options.headers["accept"] = "application/vnd.siren+json"
  }
}

const client = got.extend({
  // We want to have total control over redirects
  followRedirect: false,
  headers: {
    "user-agent": `RESTlr/${package.version}`
  },
  hooks: {
    beforeRequest: [
      options => {
        // Make this return a new options?
        determineAcceptHeader(options)
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

module.exports = client
