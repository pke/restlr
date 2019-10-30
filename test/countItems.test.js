const { t } = require("tap")

const countItems = require("../src/countItems")

t.test("count array items", t => {
  t.plan(2)
  t.is(countItems([1,2]), 2)
  t.is(countItems([]), 0)
})

t.test("count object items", t => {
  t.plan(2)
  t.is(countItems({ key1: 1, key2: 2 }), 2)
  t.is(countItems({}), 0)
})

t.test("count invalid items", t => {
  t.plan(2)
  t.is(countItems(undefined), 0)
  t.is(countItems(1), 0)
})
