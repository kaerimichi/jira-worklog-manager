module.exports = {
  run: async (commandName, options) => {
    try {
      await require(`./commands/${commandName}`)(options)
    } catch (e) {
      process.stderr.write(`${e.message}\n`)
      process.exit(127)
    }
  }
}
