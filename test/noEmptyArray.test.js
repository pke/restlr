const { t } = require("tap")

const noEmptyArray = require("../src/noEmptyArray")

t.test("compose array items", t => {
  t.plan(2)

  t.same(noEmptyArray(0,1), [0,1])
  t.same(noEmptyArray(1,undefined,3), [1,3])
})
