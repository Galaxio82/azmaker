const { EmbedBuilder, Message, Interaction, ChannelType } = require('discord.js');

class DiscordAction {

    hasSpecialCharacters(str) {
        const regex = /[^a-zA-Z0-9\s]/; // Recherche tout caractère qui n'est pas une lettre, un chiffre ou un espace
        return regex.test(str);
    }

    getChannelType(type) {
        switch (type) {
            case 'text':
                return ChannelType.GuildText;
            case 'voice':
                return ChannelType.GuildVoice;
            case 'forum':
                return ChannelType.GuildForum;
            case 'announcement':
                return ChannelType.GuildAnnouncement;
            case 'stage':
                return ChannelType.GuildStageVoice;
            default:
                return ChannelType.GuildText;
        }
    }

    sendMessage(component, text) {
        component.send(text)
            .catch(err => console.error("Erreur lors de l'envoi du message :", err));
    }

    sendEmbed(component, text) {
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

        component.send({ embeds: [embed] })
            .catch(err => console.error("Erreur lors de l'envoi de l'embed :", err));
    }

    replyMessage(component, text) {

    }

    deleteMessage(component, text) {

    }

    pinMessage(component, text) {
        component.pin()
    }

    unpinMessage(component, text) {
        component.unpin()
    }

    fetchMessage(component, text) {
        component.messages.fetch(text.id)
    }

    async banUser(component, text) {
        try {
            const user = await component.guild.members.ban(text.id, `${text.reason}`);
            component.channel.send(`${user.tag || text.id} a été banni pour : ${text.reason}`);
        } catch {
            console.error(error);
        }
    }

    async unbanUser(channel, text) {
        try {
            await component.guild.members.unban(text.id, `${text.reason}`);
            component.channel.send(`L'utilisateur avec l'ID ${text.id} a été débanni pour : ${text.reason}`);
        } catch {
            console.error(error);
        }
    }

    kickUser(channel, text) {

    }

    timeoutUser(channel, text) {

    }

    editUser(channel, text) {

    }

    addRole(channel, text) {

    }

    removeRole(channel, text) {

    }

    hasPermission(channel, text) {

    }

    createPermissionChannelOverwrites(channel, text) {

    }

    editPermissionChannelOverwrites(channel, text) {

    }

    setRolePermissions(channel, text) {

    }

    async createCategory(component, text) {
        try {
            if (component instanceof Message) {
                if (!text || text.length > 100 | typeof text.name !== 'string' || text.name.trim() === '' || this.hasSpecialCharacters(text.name)) {
                    console.error('Le nom fourni pour la catégorie est invalide.');
                    return component.channel.send('Erreur : le nom de la catégorie est invalide.');
                }

                const newCategory = await component.guild.channels.create({
                    name: text.name,
                    type: ChannelType.GuildCategory,
                    reason: `Catégorie créée par ${component.author.tag}`,
                });
                component.channel.send(`Catégorie ${newCategory.name} créée avec succès.`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    setNameCategory(component, text) {

    }

    async deleteCategory(component, text) {
        try {
            if (component instanceof Message) {
                const category = component.guild.channels.cache.find(
                    (ch) => ch.name === text.id && ch.type === 'GUILD_CATEGORY'
                );

                if (!category) {
                    return component.channel.send("Aucune catégorie trouvée avec ce nom ou ID.");
                }

                await category.delete(`Catégorie supprimée par ${message.author.tag}`);
                component.channel.send(`Catégorie ${text.id} supprimée avec succès.`);
            } else {

            }
        } catch (error) {
            console.error(error);
        }
    }

    createRole(component, text) {

    }

    editRole(component, text) {

    }

    deleteRole(component, text) {

    }

    async createChannel(component, text) {
        try {
            if (component instanceof Message) {

                if (!text || text.length > 100 | typeof text.name !== 'string' || text.name.trim() === '' || this.hasSpecialCharacters(text.name)) {
                    console.error('Le nom fourni pour la catégorie est invalide.');
                    return component.channel.send('Erreur : le nom de la catégorie est invalide.');
                }

                const channelType = this.getChannelType(text.type);

                if (channelType === ChannelType.GuildAnnouncement || channelType === ChannelType.GuildForum || channelType === ChannelType.GuildStageVoice) {
                    if (!component.guild.features.includes('COMMUNITY')) {
                        console.error('La communauté n\'est pas activée sur ce serveur.');
                        return component.channel.send('Erreur : La communauté n\'est pas activée sur ce serveur. Impossible de créer un salon d\'Annonce, de Forum ou de Conférence.');
                    }
                }

                const newChannel = await component.guild.channels.create({
                    name: text.name,
                    type: channelType,
                    reason: `Salon créé par ${component.author.tag}`,
                });
                component.channel.send(`Salon ${newChannel.name} créé avec succès.`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    editChannel(component, text) {

    }

    async deleteChannel(component, text) {
        try {
            if (component instanceof Message) {
                const channels = component.guild.channels.cache.find(
                    (ch) => ch.name === text.id || ch.id === text.id
                );

                if (!channels) {
                    return component.channel.send("Aucun salon trouvé avec ce nom ou ID.");
                }

                await channels.delete(`Salon supprimé par ${component.author.tag}`);
                component.channel.send(`Salon ${text.id} supprimé avec succès.`);
            } else { }
        } catch (error) {
            console.error(error);
        }
    }

    parentChannel(component, text) {

    }
}

module.exports = DiscordAction;