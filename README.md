# discord.js-commands-handler
<p align="center">
  <span>Simple yet powerful handler for discord.js.</span>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/discord.js-commands-handler">
    <img src="https://img.shields.io/npm/dt/discord.js-commands-handler?color=dc143c&style=flat-square" alt="downloads">
  </a>
  <a href="https://www.npmjs.com/package/discord.js-commands-handler">
    <img src="https://img.shields.io/npm/v/discord.js-commands-handler?style=flat-square&color=9400d3" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/discord.js-commands-handler">
    <img src="https://img.shields.io/bundlephobia/min/discord.js-commands-handler?style=flat-square&color=ff6347" alt="minified size">
  </a>
    <img src="https://img.shields.io/npm/l/discord.js-commands-handler?style=flat-square&color=4169e1" alt="license">
</p>

## About 
A package to Sync your bot's Commands and manage interactions

- Quickly registers new Commands
- Auto deletes deleted Commands
- Managing Interactions

## Changed
- [new Useage](#example-usage)
- [new Functions](#new-functions)

## Instaling discord.js-commands-handler

```sh-session
npm i discord.js-commands-handler
```

## Example Usage
- Create a main file

index.js (example)
```js
import { Client, GatewayIntentBits } from 'discord.js'
import Handler from "discord.js-commands-handler"

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const handler = new Handler({ client: client, commandsFolder: "commandsFolder", consoleLogging: true })

handler.synchronizeCommands()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
})

client.login(TOKEN);
```
- Create a Folder with the name you entered in the `commandsFolder` property

## Add Command
- Create a javascript file in the your `commandsFolder`
- Fill in `name`, `description [Only chatInput]` and `execute [function]` as forced in
```js
export default {
	name: "test",
	description: "Test Command",
	execute(client, interaction, options) {
		interaction.reply("Test successful")
	}
}
```
- Optionally, [`type [default: 1]`](https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType), [`guild`](https://old.discordjs.dev/#/docs/discord.js/main/class/Guild?scrollTo=id), [`permission`](https://discord-api-types.dev/api/discord-api-types-payloads/common#PermissionFlagsBits), [`options`](https://discord.js.org/#/docs/discord.js/main/typedef/ApplicationCommandOptionData), [`componentInteraction [function]`](https://old.discordjs.dev/#/docs/discord.js/main/class/MessageComponentInteraction), [`autocompleteInteraction [function]`](https://old.discordjs.dev/#/docs/discord.js/main/class/AutocompleteInteraction), [`modalInteraction [function]`](https://old.discordjs.dev/#/docs/discord.js/main/class/AutocompleteInteraction)
```js
export default {
	type: 1,
	name: "test",
	description: "Test Command",
	guild: 895139517651258664,
	options: [
		{
			type: 3,
			name: "test_option",
			description: "Test",
			autocomplete: true
		}
	],
	permissions: [
		"BanMembers",
		"KickMembers"
	],
	execute(client, interaction, options) {
		const component = {
			type: 1, // ActionRow
			components: [
				{
					type: 2, // Button
					customId: "ping.button",
					label: "Pong!",
					style: 1
				}
			]
		}
		
		interaction.reply({ components: [component] }).then(() => {
			interaction.followUp(`option: ${options.getString("test_option")}`)
		})
	},
	componentInteraction(client, interaction, customId) {
		if (customId == "button") {
			const modal = {
			title: "Test Modal",
			customId: "ping.modal",
			components: [
				{
					type: 1,
					components: [
						{
							type: 4,
							customId: "test",
							label: "Test Modal",
							style: 1,
							placeholder: "Test"
						}
					]
				}
			]
		}
		interaction.showModal(modal)
		}
	},
	autocompleteInteraction(client, interaction, focused) {
		interaction.respond(
			[
				{
					name: "test",
					value: "test"
				}
			]
		)
	},
	modalInteraction(client, interaction, customId) {
		interaction.reply("Modal triggered!")
	}
}
```

## Handling Components
- First, let's create a sample component.
- To handle interactions, prefix the `customId` property with the name of the command as in the example.
```js
const component = {
	type: 1,
	components: [
		{
			type: 2,
			customId: "ping.button",
			label: "Pong!",
			style: 1
		}
	]
}
```

- Then create a function called `componentInteraction` inside the command file and send `client`, `interaction` and `customId` arguments from the function.
- Enter the codes you want to run when the component inside the function is triggered
```js
export default {
	name: 'ping',
	description: 'Replies with Pong',
	execute(client, interaction, options) {
		const component = {
			type: 1, // ActionRow
			components: [
				{
					type: 2, // Button
					customId: "ping.button",
					label: "Pong!",
					style: 1
				}
			]
		}
		
		interaction.reply({ components: [component] })
	},
	componentInteraction(client, interaction, customId) {
		interaction.reply("Component triggered!")
	}
}
```
- If you have more than one component, you can check it `customId` (Do not write the command name where it starts).
```js
export default {
	name: 'ping',
	description: 'Replies with Pong',
	execute(client, interaction, options) {
		const component = {
			type: 1, // ActionRow
			components: [
				{
					type: 2, // Button
					customId: "ping.button",
					label: "Pong!",
					style: 1
				}
			]
		}
		
		interaction.reply({ components: [component] })
	},
	componentInteraction(client, interaction, customId) {
		if (customId == "button") {
			interaction.reply("Component triggered!")
		}
	}
}
```
## Handling Autocomplete
- First, let's create a sample autocomplete.
```js
export default {
	name: 'ping',
	description: 'Replies with Pong',
	options: [
		{
			name: "test",
			description: "Test autocomplate option",
			type: 3,
			autocomplete: true,
			required: true
		}
	],
	execute(client, interaction, options) {
		interaction.reply("Pong!")
	}
}
```
- Then create a function called `autocompleteInteraction` inside the command file and send `client`, `interaction` and `focused` arguments from the function.
```js
export default {
	name: 'ping',
	description: 'Replies with Pong',
	options: [
		{
			name: "test",
			description: "Test autocomplate option",
			type: 3,
			autocomplete: true,
			required: true
		}
	],
	execute(client, interaction, options) {
		interaction.reply("Pong!")
	},
	autocompleteInteraction(client, interaction, focused) {
		interaction.respond(
			[
				{
					name: "test",
					value: "test"
				}
			]
		)
	}
}
```
- Each time autocomplete is called the function will run and the focused value will be returned.
```js
export default {
	name: 'ping',
	description: 'Replies with Pong',
	options: [
		{
			name: "test",
			description: "Test autocomplate option",
			type: 3,
			autocomplete: true,
			required: true
		}
	],
	execute(client, interaction, options) {
		interaction.reply("Pong!")
	},
	autocompleteInteraction(client, interaction, focused) {
		console.log(focused)
	}
}
```

## Handling Modals
- First, let's create a sample modal.
- To handle interactions, prefix the `customId` property with the name of the command as in the example.
```js
export default {
	name: 'ping',
	description: 'Replies with Pong',
	execute(client, interaction, options) {
		const modal = {
			title: "Test Modal",
			customId: "ping.modal",
			components: [
				{
					type: 1,
					components: [
						{
							type: 4,
							customId: "test",
							label: "Test Modal",
							style: 1,
							placeholder: "Test"
						}
					]
				}
			]
		}
		interaction.showModal(modal)
	}
}
```
- Then create a function called `modalInteraction` inside the command file and send `client`, `interaction` and `customId` arguments from the function.
- Enter the codes you want to run when the modal inside the function is triggered
```js
export default {
	name: 'ping',
	description: 'Replies with Pong',
	execute(client, interaction, options) {
		const modal = {
			title: "Test Modal",
			customId: "ping.modal",
			components: [
				{
					type: 1,
					components: [
						{
							type: 4,
							customId: "test",
							label: "Test Modal",
							style: 1,
							placeholder: "Test"
						}
					]
				}
			]
		}
		interaction.showModal(modal)
	},
	modalInteraction(client, interaction, customId) {
		interaction.reply("Modal triggered!")
	}
}
```
- If you have more than one modal, you can check it `customId` (Do not write the command name where it starts).
```js
export default {
	name: 'ping',
	description: 'Replies with Pong',
	execute(client, interaction, options) {
		const modal = {
			title: "Test Modal",
			customId: "ping.modal",
			components: [
				{
					type: 1,
					components: [
						{
							type: 4,
							customId: "test",
							label: "Test Modal",
							style: 1,
							placeholder: "Test"
						}
					]
				}
			]
		}
		interaction.showModal(modal)
	},
	modalInteraction(client, interaction, customId) {
		if (customId == "modal") {
			interaction.reply("Modal triggered!")
		}
	}
}
```

## New Functions
### \<handler>.setCommand({ type, name, ... })
- You can create new commands from within the file you want
- Forced parameters; `name`, `description [only for chatInput commands]`, `execute [function]`
- Optionally parameters; `type`, `guild`, `permissions`, `options`, `componentInteraction [function]`,
`autocompleteInteraction [function]`, `modalInteraction [function]`
```js
<handler>.setCommand({
  //type: 1,
	name: "test",
	description: "Test Command",
  //guild: 895···42,
  //options: [ ··· ],
  //permissions: [ ··· ],
	execute(client, interaction, options) {
		interaction.reply("Test!")
	},
  //componentInteraction(client, interaction, customId) { ··· },
  //autocompleteInteraction(client, interaction, focused) { ··· },
  //modalInteraction(client, interaction, customId) { ··· }
})
```

### \<handler>.getCommand(commandName, callback() => {})
- Get information of the command with the name of your command
- Returns the information of the [promise] command or you can use the callback
```js
<handler>.getCommand("test", command => {
	console.log(command)
})

// or
<handler>.getCommand("test").then(command => {
	console.log(command)
})

// Console Output:
{
	name: "test",
	description: "Test Command",
	execute: [Function: execute]
}
```

### \<handler>.hasCommand(commandName, callback() => {})
- Checks whether your command exists with the name you entered.
- returns [promise] boolean or you can use the callback
```js
<handler>.hasCommand("test", command => {
	console.log(command)
})

// or
<handler>.hasCommand("test").then(command => {
	console.log(command)
})

// Console Output:
true
```

### \<handler>.deleteCommand(commandName, callback() => {})
- Deletes of the command with the name of your command
- Returns the information of the [promise] command or you can use the callback
```js
<handler>.deleteCommand("test", command => {
	console.log(command)
})

// or
<handler>.deleteCommand("test").then(command => {
	console.log(command)
})

// Console Output:
{
	name: "test",
	description: "Test Command",
	execute: [Function: execute]
}
```
# License
All information about the license is in the `LICENSE` file.