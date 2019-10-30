const { t } = require("tap")

const title = require("../src/title")

t.test("when title exists", t => {
  t.plan(1)
  t.is(title({ title: "The Big Lebowski" }), "The Big Lebowski")
})

t.test("title with default", t => {
  t.plan(1)
  t.is(title({ }, "The Big Lebowski"), "The Big Lebowski")
})

t.test("Default title with rel", t => {
  t.plan(1)
  t.is(title({ rel: ["index"] }, "The Big Lebowski"), "The Big Lebowski (rel=index)")
})

t.test("No rel when title", t => {
  t.plan(1)
  t.is(title({ title: "The Big Lebowski", rel: ["index"] }), "The Big Lebowski")
})
