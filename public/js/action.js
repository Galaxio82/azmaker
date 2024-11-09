let currentActionType = '';
let currentActionPage = '';
let currentActionData = {};

const actionNames = {
    ...window.DiscordActionNames,
    ...window.MysqlActionNames
};
const actionDetails = {
    ...window.DiscordActionsDetails
}

async function loadChoice() {
    const choiceAction = await window.api.choiceAction();
    currentActionPage = choiceAction.page
    if (choiceAction.page == "command" || choiceAction.page == null) {
        $('#event-list-section').hide();
        $('#command-list-section').show();
    } else {
        $('#event-list-section').show();
        $('#command-list-section').hide();
    }

    const data = choiceAction.data;
    if (data != undefined) {
        currentActionData = data
        setEditMode(true, data.name, data.type);
        loadActionDetails(data)
    } else {
        setEditMode(false);
    }
}
loadChoice();

function toggleActions(groupId) {
    const actions = $('.actions');
    actions.each(function () {
        if ($(this).attr('id') === groupId) {
            $(this).toggle();
        } else {
            $(this).hide();
        }
    });
}

function saveAction() {
    const actionType = currentActionType;
    const actionName = document.getElementById('action-name').value;
    let actionDetails = {};

    if (actionType === 'sendMessage') {
        const messageContent = document.getElementById('message-content').value;
        actionDetails = { name: actionName, type: 'sendMessage', details: messageContent };
    } else if (actionType === 'sendEmbed') {
        const embedDetails = {
            title: document.getElementById('embed-title').value || null,
            description: document.getElementById('embed-description').value || null,
            color: document.getElementById('embed-color').value || null,
            footer: document.getElementById('embed-footer').value || null,
            image: document.getElementById('embed-image').value || null,
            thumbnail: document.getElementById('embed-thumbnail').value || null,
            author: document.getElementById('embed-author').value || null,
            authorIcon: document.getElementById('embed-author-icon').value || null,
            url: document.getElementById('embed-url').value || null
        };

        actionDetails = { name: actionName, type: 'sendEmbed', details: embedDetails };
    } else if (actionType === 'createRole') {
        const roleName = document.getElementById('role-name').value;
        const roleColor = document.getElementById('role-color').value;
        actionDetails = { name: actionName, type: 'createRole', details: { name: roleName, color: roleColor } };
    }

    if (actionName && actionDetails.type) {
        if(Object.keys(currentActionData).length > 0) {
            actionDetails.isEditMode = true;
            actionDetails.id = currentActionData.id;
        }
        window.api.createAction(actionDetails);
        currentActionType = null;
        currentActionData = null;
    } else {
        return showNotification("Veuillez remplir tous les champs.", true);
    }
}

function loadActionDetails(data) {
    setActionDetails(data.type);
    const actionName = $('#action-name');
    const actionType = $('#action-type');

    actionName.val(data.name);
    actionType.val(data.type);

    if (data.type === 'sendMessage') {
        $('#message-content').val(data.details);
    } else if (data.type === 'sendEmbed') {
        const embedDetails = data.details;
        $('#embed-title').val(embedDetails.title);
        $('#embed-description').val(embedDetails.description);
        $('#embed-color').val(embedDetails.color);
        $('#embed-footer').val(embedDetails.footer);
        $('#embed-image').val(embedDetails.image);
        $('#embed-thumbnail').val(embedDetails.thumbnail);
        $('#embed-author').val(embedDetails.author);
        $('#embed-author-icon').val(embedDetails.authorIcon);
        $('#embed-url').val(embedDetails.url);
    } else if (data.type === 'createRole') {
        const roleDetails = data.details;
        $('#role-name').val(roleDetails.name);
        $('#role-color').val(roleDetails.color);
    }
}

function setActionDetails(actionType) {
    currentActionType = actionType;
    const $actionFields = $('#action-fields');
    const $actionTypes = $('#action-types');

    if (actionDetails[actionType]) {
        $actionTypes.html(actionNames[currentActionType] || "Action inconnue");
        $actionFields.html(actionDetails[actionType]);
    }
}

function setEditMode(isEditMode, name, type) {
    const indicator = $('#edit-mode-indicator');
    const editText = $('#edit-mode-text');
    const description = $('#edit-mode-description');

    if (isEditMode) {
        console.log("Mode édition activé");
        editText.text('Mode Edition');
        description.html(`Vous modifiez l'action "<strong>${name}</strong>" de type "<strong>${type}</strong>"`);
        indicator.show();
    } else {
        editText.text('Mode Création');
        description.text('');
        indicator.show();
    }
}

function cancelAction() {
    window.api.actionWindow("close");
}