
function githubEntity(json) {
  return Object.keys(json).reduce((siren, key) => {
    let value = json[key]
    let url
    if ((url = key.match(/([a-z]*)_?url$/))) {
      const link = {
        href: json[key],
        // the "url" key points to the requested resource
        // All other "_url" will get their title from the capture group
        title: url[1] || "Self",
        type: "application/vnd.github.v3+json"
      }
      if (!url[1]) {
        link.rel = ["self"]
      }
      siren.links.push(link)
    } else {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
        value = new Date(value)
      }
      if (key === "name") {
        siren.title = value
      }
      siren.properties[key] = value
    }
    return siren
  }, {
    properties: {},
    links: []
  })
}

function toSiren(json) {
  if (Array.isArray(json)) {
    return {
      entities: json.map(githubEntity)
    }
  } else {
    return githubEntity(json)
  }
}

module.exports = {
  handleResponse: toSiren
}
