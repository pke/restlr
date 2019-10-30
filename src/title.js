function rel(item) {
  if (Array.isArray(item.rel)) {
    return `rel=${item.rel.join(" ")}`
  }
  return ""
}

module.exports = function title(item, defaultTitle = "unnamed") {
  return item.title || (rel(item) && `${defaultTitle} (${rel(item)})`) || defaultTitle
}
