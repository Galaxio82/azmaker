window.DiscordActionNames = {
    sendMessage: "Envoyer un message",
    sendEmbed: "Envoyer un embed",
    replyMessage: "Répondre à un message",
    deleteMessage: "Supprimer un message",
    pinMessage: "Épingler un message",
    unpinMessage: "Désépingler un message",
    fetchMessage: "Récupérer des messages",
    banUser: "Bannir un utilisateur",
    unbanUser: "Débannir un utilisateur",
    kickUser: "Expulser un utilisateur",
    timeoutUser: "Timeout un utilisateur",
    editUser: "Modifier un utilisateur",
    addRole: "Ajouter un rôle à un utilisateur",
    removeRole: "Retirer un rôle d'un utilisateur",
    hasPermission: "Vérifier les permissions d'un membre",
    createPermissionChannelOverwrites: "Gérer les permissions dans un salon",
    editPermissionChannelOverwrites: "Modifier les permissions dans un salon",
    setRolePermissions: "Définir les permissions d'un rôle",
    createCategory: "Créer une Catégorie",
    setNameCategory: "Renommer une Catégorie",
    createRole: "Créer un rôle",
    editRole: "Modifier un rôle",
    deleteRole: "Supprimer un rôle",
    createChannel: "Créer un canal",
    editChannel: "Modifier un canal",
    deleteChannel: "Supprimer un canal",
    parentChannel: "Déplacer un canal dans une catégorie",
    createWebhook: "Créer un Webhook",
    sendWebhook: "Envoyer avec un Webhook",
    editWebhook: "Modifier un Webhook",
    deleteWebhook: "Supprimer un Webhook"
};

window.DiscordActionsDetails = {
    sendMessage: `
        <label for="message-content">Message :</label>
        <input type="text" id="message-content" placeholder="Entrez votre message" />
    `,
    sendEmbed: `
        <div class="embed-group">
            <div>
                <label for="embed-title">Titre :</label>
                <input type="text" id="embed-title" placeholder="Titre de l'embed" />
            </div>

            <div>
                <label for="embed-description">Description :</label>
                <textarea id="embed-description" placeholder="Description"></textarea>
            </div>

            <div>
                <label for="embed-color">Couleur :</label>
                <input type="color" id="embed-color" class="color-input" />
            </div>

            <div class="full-width">
                <label for="embed-footer">Pied de page :</label>
                <input type="text" id="embed-footer" placeholder="Texte du pied de page" />
            </div>

            <div>
                <label for="embed-image">Image URL :</label>
                <input type="text" id="embed-image" placeholder="URL de l'image" />
            </div>

            <div>
                <label for="embed-thumbnail">Miniature URL :</label>
                <input type="text" id="embed-thumbnail" placeholder="URL de la miniature" />
            </div>

            <div>
                <label for="embed-author">Auteur :</label>
                <input type="text" id="embed-author" placeholder="Nom de l'auteur" />
            </div>

            <div>
                <label for="embed-author-icon">Icône de l'auteur :</label>
                <input type="text" id="embed-author-icon" placeholder="URL de l'icône de l'auteur" />
            </div>

            <div class="full-width">
                <label for="embed-url">URL de l'auteur :</label>
                <input type="text" id="embed-url" placeholder="URL de l'auteur" />
            </div>
        </div>
    `,
    replyMessage: `
        <label for="message-content">Message :</label>
        <input type="text" id="message-content" placeholder="Entrez votre message" />
    `,
    deleteMessage: `
        <label for="message-id">Message :</label>
        <input type="text" id="message-id" placeholder="Id du message" />
    `,
    pinMessage: `
        <label for="message-id">Message :</label>
        <input type="text" id="message-id" placeholder="Id du message" />
    `,
    unpinMessage: `
        <label for="message-id">Message :</label>
        <input type="text" id="message-id" placeholder="Id du message" />
    `,
    fetchMessage: `
        <label for="message-id">Message :</label>
        <input type="text" id="message-id" placeholder="Id du message" />
    `,
    banUser: `
        <label for="user-id">ID de l'utilisateur :</label>
        <input type="text" id="user-id" placeholder="Entrez l'ID de l'utilisateur à bannir" />
    `,
    unbanUser: `
        <label for="user-id">ID de l'utilisateur :</label>
        <input type="text" id="user-id" placeholder="Entrez l'ID de l'utilisateur à bannir" />
    `,
    kickUser: `
        <label for="user-id">ID de l'utilisateur :</label>
        <input type="text" id="user-id" placeholder="Entrez l'ID de l'utilisateur à expulser" />
    `,
    timeoutUser: `
        <label for="user-id">ID de l'utilisateur :</label>
        <input type="text" id="user-id" placeholder="Entrez l'ID de l'utilisateur à timeout" />
    `,
    editUser: `
        <label for="user-id">ID de l'utilisateur :</label>
        <input type="text" id="user-id" placeholder="Entrez l'ID de l'utilisateur à modifier" />
    `,
    addRole: `
        <label for="user-id">ID de l'utilisateur :</label>
        <input type="text" id="user-id" placeholder="Entrez l'ID de l'utilisateur" />
        <label for="role-id">ID du rôle :</label>
        <input type="text" id="role-id" placeholder="Entrez l'ID du rôle à ajouter" />
    `,
    removeRole: `
        <label for="user-id">ID de l'utilisateur :</label>
        <input type="text" id="user-id" placeholder="Entrez l'ID de l'utilisateur" />
        <label for="role-id">ID du rôle :</label>
        <input type="text" id="role-id" placeholder="Entrez l'ID du rôle à enlever" />
    `,
    hasPermission: `
        <label for="user-id">ID de l'utilisateur :</label>
        <input type="text" id="user-id" placeholder="Entrez l'ID de l'utilisateur à vérifier" />
    `,
    createPermissionChannelOverwrites: `
        <label for="user-id">ID du canal :</label>
        <input type="text" id="user-id" placeholder="Entrez l'ID du canal à créer" />
    `,
    editPermissionChannelOverwrites: `
        <label for="channel-id">ID du canal :</label>
        <input type="text" id="channel-id" placeholder="Entrez l'ID du canal à modifier" />
    `,
    setRolePermissions: `
        <label for="role-id">ID du rôle :</label>
        <input type="text" id="role-id" placeholder="Entrez l'ID du rôle" />
    `,
    createCategory: `
        <label for="category-name">Catégorie :</label>
        <input type="text" id="category-name" placeholder="Nom de la catégorie" />
    `,
    setNameCategory: `
        <label for="category-name">Catégorie :</label>
        <input type="text" id="category-name" placeholder="Nom de la catégorie" />
    `,
    createRole: `
        <label for="role-name">Nom du rôle :</label>
        <input type="text" id="role-name" placeholder="Entrez le nom du rôle" />
        <label for="role-color">Couleur du rôle :</label>
        <input type="color" id="role-color" class="color-input" />
    `,
    editRole: `
        <label for="role-name">Nom du rôle :</label>
        <input type="text" id="role-name" placeholder="Entrez le nom du rôle" />
        <label for="role-color">Couleur du rôle :</label>
        <input type="color" id="role-color" class="color-input" />
    `,
    deleteRole: `
        <label for="role-id">Rôle :</label>
        <input type="text" id="role-id" placeholder="Id du rôle" />
    `,
    createChannel: `
        <label for="channel-name">Nom du Canal :</label>
        <input type="text" id="channel-name" placeholder="Entrez le nom du Canal" />
        <label for="channel-type">Type de Canal :</label>
        <select id="channel-type">
            <option value="text">Texte</option>
            <option value="voice">Vocal</option>
            <option value="forum">Forum</option>
            <option value="announcement">Annonce</option>
            <option value="stage">Conférence</option>
        </select>
    `,
    editChannel: `
        <label for="channel-name">Nom du Canal :</label>
        <input type="text" id="channel-name" placeholder="Entrez le nom du Canal" />
        <label for="channel-type">Type de Canal :</label>
        <select id="channel-type">
            <option value="text">Texte</option>
            <option value="voice">Vocal</option>
            <option value="forum">Forum</option>
            <option value="announcement">Annonce</option>
            <option value="stage">Conférence</option>
        </select>
    `,
    deleteChannel: `
        <label for="channel-id">Canal :</label>
        <input type="text" id="channel-id" placeholder="Entrez l'ID du Canal" />
    `,
    parentChannel: `
        <label for="channel-id">Canal :</label>
        <input type="text" id="channel-id" placeholder="Entrez l'ID du Canal" />
        <label for="category-id">Catégorie :</label>
        <input type="text" id="category-id" placeholder="Entrez l'ID de la catégorie" />
    `
};