const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const rpc = require("discord-rpc");
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const client = new rpc.Client({ transport: 'ipc' });
let startTime = Date.now();

class DiscordBot {
    constructor() {
        this.client = null;
        this.configPath = path.join(app.getPath('userData'), './Local/config.json');
    }

    loadConfig() {
        if (fs.existsSync(this.configPath)) {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        }
        return null;
    }

    readComponents(component) {
        const commandsPath = path.join(app.getPath('userData'), `./Local/${component}.json`);
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
                console.log('Discord RPC connecté !');
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
            console.log("Le bot est déjà en cours d'exécution.");
            event.sender.send('bot-error', 'Le bot est déjà en cours d\'exécution.');
            return;
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
                event.sender.send('bot-info', {
                    username: this.client.user.username,
                    id: this.client.user.id,
                    avatar: this.client.user.displayAvatarURL(),
                    status: this.client.user.presence.status || 'offline'
                });
            })
            .catch(error => {
                console.error("Erreur de connexion:", error);
                event.sender.send('bot-error', 'Erreur de connexion au bot Discord.');
            });

        this.client.on('messageCreate', (message) => {
            const commands = this.readComponents("commands");
            this.handlePrefixCommands(message, commands);
        });

        this.client.on('interactionCreate', (interaction) => {
            const commands = this.readComponents("commands");
            this.handleSlashCommands(interaction, commands)
        })

        this.client.once('ready', async () => {
            console.log(`Connecté en tant que ${this.client.user.tag}`);
            const commands = this.readComponents("commands");
            await this.registerSlashCommands(this.client, "1012307943733084231", commands);
        });
    }

    stopBot() {
        if (this.client) {
            this.client.destroy()
                .then(() => {
                    console.log("Bot arrêté avec succès");
                    this.client = null;
                })
                .catch(error => {
                    console.error("Erreur lors de l'arrêt du bot:", error);
                });
        } else {
            console.log("Aucun bot en cours d'exécution.");
        }
    }

    handlePrefixCommands(message, commands) {
        commands.forEach(cmd => {
            if (cmd.commandType == "PREFIX") {
                if (message.content.startsWith(cmd.trigger)) {
                    if (cmd.permissions.length > 0 && cmd.permissions[0] !== 'NoPermission') {
                        const hasPermission = cmd.permissions.some(permission => 
                            message.member.permissions.has(permission)
                        );
                    
                        if (!hasPermission) {
                            return message.reply("Vous n'avez pas la permission d'exécuter cette commande.");
                        }
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
                message.channel.send(text);
                break;
            case 'sendEmbed':
                const embed = new EmbedBuilder()
                    .setColor(text.color || '#0099ff');
                
                if (text.title) embed.setTitle(text.title);
                if (text.description) embed.setDescription(text.description);
                if (text.footer) {
                    embed.setFooter({ text: text.footer });
                }
                if (text.image) {
                    if (typeof text.image === 'string' && text.image.startsWith('http')) {
                        embed.setImage(text.image);
                    } else {
                        console.warn("L'URL de l'image n'est pas valide:", text.image);
                    }
                }
                if (text.thumbnail) {
                    if (typeof text.thumbnail === 'string' && text.thumbnail.startsWith('http')) {
                        embed.setThumbnail(text.thumbnail);
                    } else {
                        console.warn("L'URL du thumbnail n'est pas valide:", text.thumbnail);
                    }
                }
                if (text.author) embed.setAuthor(text.author, text.authorIcon || undefined);
                if (text.url) embed.setURL(text.url);
    
                message.channel.send({ embeds: [embed] })
                    .catch(err => console.error("Erreur lors de l'envoi de l'embed :", err));
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
                        return match; // Placeholder remains if property is missing
                    }
                }
                return value !== undefined ? value : match;
            });
        };
    
        if (typeof data === 'string') {
            const withDynamicPlaceholders = dynamicReplace(data);
            return withDynamicPlaceholders.replace(/{{(\w+)}}/g, (match, key) => args[key] || match);
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

        if (command.permissions !== 'Aucune' && !interaction.member.permissions.has(command.permissions.split(', '))) {
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
            console.error("Le client n'est pas prêt ou l'utilisateur n'est pas défini.");
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
            console.log('Aucune commande valide à enregistrer.');
            return;
        }

        const rest = new REST().setToken(client.token);

        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: [] })
            .then(() => console.log('Successfully deleted all guild commands.'))
            .catch(console.error);

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            const data = await rest.put(
                Routes.applicationGuildCommands(client.user.id, guildId),
                { body: commandData },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = DiscordBot;
