module.exports = typeof v8debug === "object" || /--debug|--inspect/.test(process.execArgv.join(" "))
