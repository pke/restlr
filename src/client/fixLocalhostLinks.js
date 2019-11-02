module.exports = function fixLocalhostLinks(host, href) {
  return href.replace(/(\w+?):\/\/(?:localhost|127.0.0.1)(:\d+)?/gi, `$1://${host}$2`)
}
