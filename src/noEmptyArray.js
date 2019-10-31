module.exports = function noEmptyArray() {
  return Array.from(arguments).filter(item => item !== undefined)
}
