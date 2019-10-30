module.exports = function visitItems(method, arrayOrObject, visitor) {
  if (Array.isArray(arrayOrObject)) {
    return arrayOrObject[method](visitor)
  } else if (typeof arrayOrObject === "object") {
    return Object.keys(arrayOrObject)[method](key => visitor(arrayOrObject[key], key))
  }
}
