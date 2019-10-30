module.exports = function fieldItem(item) {
  return {
    name: item.name,
    message: item.title,
    initial: item.value,
    disabled: item.type === "hidden",
    format(input) {
      if (item.type === "password") {
        let color = this.state.submitted ? this.styles.primary : this.styles.muted
        return color(this.symbols.asterisk.repeat(input.length))
      }
      return input
    }
  }
}
