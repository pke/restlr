const { t } = require("tap")

const fixLocalhostLinks = require("../src/fixLocalhostLinks")

t.test("Fix localhost", t => {
  t.plan(3)
  
  t.is(fixLocalhostLinks("thedudeabid.es", "http://localhost:1337/path?query"), "http://thedudeabid.es:1337/path?query")
  t.is(fixLocalhostLinks("thedudeabid.es", "https://localhost:1337/path?query"), "https://thedudeabid.es:1337/path?query")
  t.is(fixLocalhostLinks("thedudeabid.es", "ws://localhost:1337/channel"), "ws://thedudeabid.es:1337/channel")
})

t.test("Fix 127.0.0.1", t => {
  t.plan(3)
  
  t.is(fixLocalhostLinks("thedudeabid.es", "http://127.0.0.1:1337/path?query"), "http://thedudeabid.es:1337/path?query")
  t.is(fixLocalhostLinks("thedudeabid.es", "https://127.0.0.1:1337/path?query"), "https://thedudeabid.es:1337/path?query")
  t.is(fixLocalhostLinks("thedudeabid.es", "ws://127.0.0.1:1337/channel"), "ws://thedudeabid.es:1337/channel")
})
