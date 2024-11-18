const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const rpc = require("discord-rpc");
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const DiscordAction = require('./discordAction');
const logger = require('./logger');
const discordAction = new DiscordAction();

const client = new rpc.Client({ transport: 'ipc' });
let startTime = Date.now();

class DiscordBot {
    constructor(project = null) {
        this.project = project;
        this.client = null;
    }

    setProject(project) {
        this.project = project;
    }

    loadConfig() {
        if (fs.existsSync(path.join(app.getPath('userData'), `./Local/projects/${this.project}/config.json`))) {
            return JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), `./Local/projects/${this.project}/config.json`), 'utf-8'));
        }
        return null;
    }

    readComponents(component, project = false) {
        let commandsPath;
        if(project) {
            commandsPath = path.join(app.getPath('userData'), `./Local/projects/${this.project}/${component}.json`);   
        } else {
            commandsPath = path.join(app.getPath('userData'), `./Local/${component}.json`);
        }
        if (fs.existsSync(commandsPath)) {
            const data = fs.readFileSync(commandsPath);
            return JSON.parse(data);
        }
        return [];    
    }

    loginPresence() {
        const clientId = '1003448155154685952';
        
        return new Promise((resolve, reject) => {
            client.login({ clientId }).catch((error) => {
                reject(error);
            });
    
            client.on('ready', () => {
                logger.info('Discord RPC connecté !');
                resolve();
            });
        });
    }

    updatePresence(details, state) {
        if (client && client.transport.socket) {
            client.request('SET_ACTIVITY', {
                pid: process.pid,
                activity: {
                    details: details,
                    state: state,
                    assets: {
                        large_image: "az",
                        large_text: "Test 1"
                    },
                    timestamps: {
                        start: startTime,
                    },
                }
            }).catch(console.error);
        }
    }
    
    startBot(event) {
        const config = this.loadConfig();
        const token = config.token;

        if (this.client) {
            return event.sender.send('bot-status', { success: false, message: 'Le bot est déjà en cours d\'exécution.' });
        }

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.client.login(token)
            .then(() => {
                let data = { username: this.client.user.username, id: this.client.user.id, avatar: this.client.user.displayAvatarURL(), status: this.client.user.presence.status || 'offline'}
                event.sender.send('bot-status', { success: true, data: data });
            })
            .catch(error => {
                logger.error(`Erreur de connexion : ${error}`);
                return event.sender.send('bot-status', { success: false, message: 'Erreur de connexion au bot Discord.' });
            });

        const events = this.readComponents("events", true)
        if (Array.isArray(events) && events.length > 0) {
            events.forEach((evt) => {
                if(evt.eventType == "messageCreate") {
                    this.client.on('messageCreate', (message) => {
                        const commands = this.readComponents("commands", true);
                        if(message.author.bot) return;
                        this.handlePrefixCommands(message, commands);
                    }); 
                }

                if(evt.eventType == "interactionCreate") {
                    this.client.on('interactionCreate', (interaction) => {
                        const commands = this.readComponents("commands", true);
                        this.handleSlashCommands(interaction, commands)
                    })
                }
            })
        }

        this.client.once('ready', async () => {
            logger.info(`Connecté en tant que ${this.client.user.tag}`);
            const commands = this.readComponents("commands", true);
            await this.registerSlashCommands(this.client, "1012307943733084231", commands);
        });
    }

    stopBot() {
        if (this.client) {
            this.client.destroy()
                .then(() => {
                    logger.info("Bot arrêté avec succès");
                    this.client = null;
                })
                .catch(error => {
                    logger.error(`Erreur lors de l'arrêt du bot : ${error}`);
                });
        } else {
            logger.info("Aucun bot en cours d'exécution");
        }
    }

    handlePrefixCommands(message, commands) {
        commands.forEach(cmd => {
            if (cmd.commandType == "PREFIX") {
                if (message.content.startsWith(cmd.trigger)) {
                    if (cmd.permissions !== 'NoPermission' && !cmd.permissions.every(permission => message.member.permissions.has(permission))) {
                        return message.channel.send({ content: "Vous n'avez pas la permission d'exécuter cette commande." });
                    }
    
                    const args = this.extractArguments(message.content, cmd.trigger, cmd.arguments);
    
                    if (cmd.arguments.length > 0) {
                        if (Object.values(args).some(arg => arg === null || arg === '')) {
                            const missingArgs = cmd.arguments
                                .map(arg => args[arg.name] === null || args[arg.name] === '' ? `\`${arg.name}\`` : null)
                                .filter(arg => arg !== null)
                                .join(', ');
    
                            return message.channel.send(`Vous devez spécifier les arguments suivants : ${missingArgs}`);
                        }
                    }

                    cmd.actions.forEach(action => {
                        const textToSend = this.injectPlaceholders(action.details, args, message, null);
                        this.executeAction(action, message, textToSend);
                    }); 
                }
            }
        });
    }

    executeAction(action, message, text) {
        switch (action.type) {
            case 'sendMessage':
                discordAction.sendMessage(message.channel, text);
                break;
            case 'sendEmbed':
                discordAction.sendEmbed(message.channel, text);
                break;
            case 'createCategory':
                discordAction.createCategory(message, text);
                break;
            case 'deleteCategory':
                discordAction.deleteCategory(message, text);
                break;
            case 'createChannel':
                discordAction.createChannel(message, text);
                break;
            case 'deleteChannel':
                discordAction.deleteChannel(message, text);
                break;
        }
    }
    

    extractArguments(content, trigger, argument) {
        const args = {};
        const argsContent = content.slice(trigger.length).trim().split(/\s+/);
    
        argument.forEach((arg, index) => {
            if (argsContent[arg.order - 1] !== undefined) {
                args[arg.name] = argsContent[arg.order - 1];
            } else {
                args[arg.name] = null;
            }
        });
    
        return args;
    }

    injectPlaceholders(data, args, message = null, interaction = null) {
        const dynamicReplace = (text) => {
            return text.replace(/{{(message|interaction)\.([\w.]+)}}/g, (match, objectType, propertyPath) => {
                const properties = propertyPath.split('.');
                let value = objectType === 'message' ? message : interaction;
    
                for (const prop of properties) {
                    if (value && typeof value === 'object' && prop in value) {
                        value = value[prop];
                    } else {
                        return match;
                    }
                }
                return value !== undefined ? value : match;
            });
        };
    
        if (typeof data === 'string') {
            let withDynamicPlaceholders = dynamicReplace(data);
            withDynamicPlaceholders = withDynamicPlaceholders.replace(/\\n/g, '\n').replace(/\\n\\n/g, '\n\n')

            return withDynamicPlaceholders.replace(/{{(\w+(\.\w+)*)}}/g, (match, key) => {
                const keys = key.split('.');
                let value = args[keys[0]];
            
                for (let i = 1; i < keys.length; i++) {
                    if (value && typeof value === 'object' && keys[i] in value) {
                        value = value[keys[i]];
                    } else {
                        return match;
                    }
                }
                return value !== undefined ? value : match;
            });
        } else if (Array.isArray(data)) {
            return data.map(item => this.injectPlaceholders(item, args, message, interaction));
        } else if (typeof data === 'object' && data !== null) {
            const newData = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    newData[key] = this.injectPlaceholders(data[key], args, message, interaction);
                }
            }
            return newData;
        }
        return data;
    }
    
    handleSlashCommands(interaction, commands) {
        if (!interaction.isCommand()) return;

        const command = commands.find(cmd => cmd.trigger === interaction.commandName);

        if (!command) {
            return interaction.reply({ content: "Cette commande n'existe pas.", ephemeral: true });
        }

        if (command.permissions !== 'NoPermission' && !command.permissions.every(permission => interaction.member.permissions.has(permission))) {
            return interaction.reply({ content: "Vous n'avez pas la permission d'exécuter cette commande.", ephemeral: true });
        }

        const args = {};
        command.arguments.forEach(arg => {
            let argValue;
            switch (arg.type) {
                case 'addStringOption':
                    argValue = interaction.options.getString(arg.name);
                    break;
                case 'addBooleanOption':
                    argValue = interaction.options.getBoolean(arg.name);
                    break;
                case 'addChannelOption':
                    argValue = interaction.options.getChannel(arg.name);
                    break;
                case 'addRoleOption':
                    argValue = interaction.options.getRole(arg.name);
                    break;
                case 'addUserOption':
                    argValue = interaction.options.getUser(arg.name);
                    break;
                case 'addIntegerOption':
                    argValue = interaction.options.getInteger(arg.name);
                    break;
                default:
                    break;
            }
            args[arg.name] = argValue;
        });

        const messageToSend = this.injectPlaceholders(command.actions[0].details, args, null, interaction);

        interaction.reply(messageToSend);
    }

    async registerSlashCommands(client, guildId, commands) {
        if (!client.user) {
            logger.error("Le client n'est pas prêt ou l'utilisateur n'est pas défini");
            return;
        }

        const commandData = commands.map(cmd => {
            if (cmd.commandType === "SLASH") {
                const sortedArguments = cmd.arguments.sort((a, b) => {
                    return (parseInt(a.order) || 0) - (parseInt(b.order) || 0);
                });

                return {
                    name: cmd.trigger,
                    description: `Description de la commande ${cmd.trigger}`,
                    options: sortedArguments.map(arg => {
                        const option = {
                            name: arg.name,
                            description: arg.description || '',
                            required: arg.required || false,
                        };

                        switch (arg.type) {
                            case 'addStringOption':
                                option.type = 3;
                                break;
                            case 'addBooleanOption':
                                option.type = 5;
                                break;
                            case 'addChannelOption':
                                option.type = 7;
                                break;
                            case 'addRoleOption':
                                option.type = 8;
                                break;
                            case 'addUserOption':
                                option.type = 6;
                                break;
                            case 'addIntegerOption':
                                option.type = 4;
                                break;
                            default:
                                break;
                        }
                        return option;
                    }),
                };
            }
        }).filter(Boolean);

        if (commandData.length === 0) {
            logger.info('Aucune commande valide à enregistrer');
            return;
        }

        const rest = new REST().setToken(client.token);

        // await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: [] })
        //     .then(() => console.log('Successfully deleted all guild commands.'))
        //     .catch(console.error);
        try {
            logger.info("Démarrage de l'actualisation des commandes de l'application (/)");
            const data = await rest.put(
                Routes.applicationGuildCommands(client.user.id, guildId),
                { body: commandData },
            );

            logger.info(`Rechargement réussi des ${data.length} commandes de l'application ${data.length} (/)`);
        } catch (error) {
            logger.error(error);
        }
    }
}

module.exports = DiscordBot;
