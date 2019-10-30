module.exports = function actionItem(action) {
  return {
    name: action.name,
    message: action.title || action.name
  }
}
