const { readdir } = require("fs").promises

async function findPlugins() {
  const allDirs = await readdir(".", { withFileTypes: true })
  const pluginDirs = allDirs
    .filter(dir => dir.name.indexOf("restlr-plugin-") === 0)
    .map(dir => dir.name)
  return pluginDirs
}

module.exports = findPlugins
