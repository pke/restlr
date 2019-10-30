module.exports = function countItems(arrayOrObject = []) {
  if (Array.isArray(arrayOrObject)) {
    return arrayOrObject.length
  } else if (typeof arrayOrObject === "object") {
    return Object.keys(arrayOrObject).length
  }
  return 0
}
