import fs from "fs"
const commands = new Map()

export default class Handler{
	#client; #commandsFolder; #consoleLogging
	constructor({ client, commandsFolder, consoleLogging} ) {
		this.#client = client
		this.#consoleLogging = consoleLogging
		this.#commandsFolder = commandsFolder
		this.#importCommands()
	}

	async setCommand(command={ type: 1, name, description, guild, permissions, options, execute() {}, componentInteraction() {}, autocompleteInteraction() {}, modalInteraction() {} }) {
		await fs.writeFileSync(`${process.cwd().replaceAll("\\", "/")}/${this.#commandsFolder}/${command.name}.js`, `export default {${command.type ? `\n\ttype: ${command.type},` : ""}${command.name ? `\n\tname: "${command.name}",` : ""}${command.description ? `\n\tdescription: "${command.description}",` : ""}${command.guild ? `\n\tguild: ${command.guild},` : ""}${command.permissions ? `\n\tpermissions: ${command.permissions},` : ""}${command.options ? `\n\toptions: ${JSON.stringify(command.options)},` : ""}${command.execute.toString() ? `\n\t${command.execute.toString()},` : ""}${command.componentInteraction?.toString() ? `\n\t${command.componentInteraction?.toString()},` : ""}${command.autocompleteInteraction?.toString() ? `\n\t${command.autocompleteInteraction?.toString()},` : ""}${command.modalInteraction?.toString() ? `\n\t${command.modalInteraction?.toString()}` : ""}\n}`)
		await import(`file://${process.cwd().replaceAll("\\", "/")}/${this.#commandsFolder}/${command.name}.js`).then(file => commands.set(file.default.name, file.default))
		this.#client.guilds.cache.forEach(async guild => {
			await guild.commands.fetch().then(() => {
				if (command.guild == guild.id) {
					guild.commands.create({
						type: command.type,
						name: command.name,
						description: command.description,
						defaultMemberPermissions: command.permissions,
						options: command.options
					})
					if (this.#consoleLogging) {
						console.log(`Command synchronized > ${command.name[0].toUpperCase() + command.name.slice(1)}`)
					}
				} else {
					guild.commands.create({
						type: command.type,
						name: command.name,
						description: command.description,
						defaultMemberPermissions: command.permissions,
						options: command.options
					})
					if (this.#consoleLogging) {
						console.log(`Command synchronized > ${command.name[0].toUpperCase() + command.name.slice(1)}`)
					}
				}
			})
		})
	}

	async getCommand(commandName, callback=command => {}) {
		if (!commands.size) await this.#importCommands()
		
		return callback(commands.get(commandName))
	}

	async hasCommand(commandName, callback=command => {}) {
		if (!commands.size) await this.#importCommands()
		
		return callback(commands.has(commandName))
	}

	async deleteCommand(commandName, callback = command => {}) {
		if (!commands.size) await this.#importCommands()

		commands.delete(commandName)
		this.#client.guilds.cache.forEach(async guild => guild.commands.delete(guild.commands.get(commandName)))
		fs.readdirSync(`${process.cwd().replaceAll("\\", "/")}/${this.#commandsFolder}`).filter(async commandFile => {
			const file = await import(`file://${process.cwd().replaceAll("\\", "/")}/${this.#commandsFolder}/${commandFile}`)
			if (file.default.name == commandName) {
				fs.unlinkSync(`${process.cwd().replaceAll("\\", "/")}/${this.#commandsFolder}/${commandFile}`)
				return callback(file.default)
			}
		})
		
	}

	async #importCommands() {
		for (let commandFile of fs.readdirSync(`${process.cwd().replaceAll("\\", "/")}/${this.#commandsFolder}`)) {
			const file = await import(`file://${process.cwd().replaceAll("\\", "/")}/${this.#commandsFolder}/${commandFile}`)
			commands.set(file.default.name, file.default)
		}
	}

	async synchronizeCommands() {
		await (this.#client.readyAt ? Promise.resolve() : new Promise(resolve => this.#client.on('ready', resolve)))
		
		this.#client.guilds.cache.forEach(async guild => {
			await guild.commands.fetch().then(() => {
				commands.forEach(command => {
					if (command.guild == guild.id) {
						guild.commands.create({
							type: command.type,
							name: command.name,
							description: command.description,
							defaultMemberPermissions: command.permissions,
							options: command.options
						})

						if (this.#consoleLogging) {
							console.log(`Command synchronized > ${command.name[0].toUpperCase() + Command.name.slice(1)}`)
						}
					} else {
						guild.commands.create({
							type: command.type,
							name: command.name,
							description: command.description,
							defaultMemberPermissions: command.permissions,
							options: command.options
						})

						if (this.#consoleLogging) {
							console.log(`Command synchronized > ${command.name[0].toUpperCase() + command.name.slice(1)}`)
						}
					}
				})

				guild.commands.cache.forEach(command => {
					if (!Array.from(commands.keys()).includes(command.name)) {
						guild.commands.delete(command.id)
					}
				})
			})
		})

		this.#client.on('interactionCreate', async (interaction) => {
			if (interaction.isCommand()) {
				const command = commands.get(interaction.command.name)

				try {
					command.execute(this.#client, interaction, interaction.options)
				} catch (error) {
					interaction.reply({
						embeds: [
							{
								title: '❌ Error ❌',
								description: 'An error occurred while running this command',
								color: 0xff0000
							}
						]
					})
					console.error(error)
				}
			} else if (interaction.isMessageComponent()) {
				const command = commands.get(interaction.customId.split(".")[0])

				try {
					command.componentInteraction(this.#client, interaction, interaction.customId.split(".")[1])
				} catch (error) {
					console.error(error)
				}
			} else if (interaction.isAutocomplete()) {
				const command = commands.get(interaction.command.name)

				try {
					command.autocompleteInteraction(this.#client, interaction, interaction.options.getFocused())
				} catch (error) {
					console.error(error)
				}
			} else if (interaction.isModalSubmit()) {
				const command = commands.get(interaction.customId.split(".")[0])

				try {
					command.modalInteraction(this.#client, interaction, interaction.customId.split(".")[1])
				} catch (error) {
					console.error(error)
				}
			}
		})

		this.#client.on('guildCreate', (guild) => {
			commands.forEach(command => {
				if (command.guild == guild.id) {
					guild.commands.create({
						type: command.type,
						name: command.name,
						description: command.description,
						defaultMemberPermissions: command.permissions,
						options: command.options,
					})
				} else {
					guild.commands.create({
						type: command.type,
						name: command.name,
						description: command.description,
						defaultMemberPermissions: command.permissions,
						options: command.options,
					})
				}
			})
		})
	}
}