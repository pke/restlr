const visitItems = require("./visitItems")

module.exports = function countItems(arrayOrObject = []) {
  let count = 0
  visitItems("some", arrayOrObject, (_item,_index,array) => count = array.length)
  return count
}
