/**
 * @argument {Number} timeout in milliseconds
 * @argument {Arguments} args to resolve the promise with.
 * If that is one argument then this is passed to the resolve function, otherwise
 * its an array of args
 */
module.exports = function waitp(timeout, ...args) {
  return new Promise(resolve => (
    global.setTimeout(resolve, timeout, args.length === 1 ? args[0] : args)
  ))
}
