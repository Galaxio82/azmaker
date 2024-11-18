let isEditMode = false;
$('.permissions').val('Aucune');

let currentNumberCommandId;
let currentCommandId;

function toggleDropdown() {
    $('#dropdown').toggle().scrollTop(0);
}

async function loadCommands() {
    const commands = await window.api.loadComponent({ name: "commands", project: true });
    const commandsContainer = $('#commands-container');
    commandsContainer.empty();

    currentNumberCommandId = Math.max(0, ...commands.map(cmd => Number(cmd.id) || 0))

    if (Array.isArray(commands) && commands.length > 0) {
        commands.forEach(cmd => {
            const listItem = $('<div>')
                .addClass('command-item')
                .text(`${cmd.commandName} (${cmd.trigger})`)
                .on('click', () => {
                    cancelEdit();
                    isEditMode = true;
                    $('#selected-permissions-container').empty();
                    const actionButton = $('.command-buttons'); $('.addCommandButton').text('Modifier la commande');
                    const deleteButton = $('<button>').addClass('deleteCommandButton').text('Supprimer la Commande').on('click', () => { deleteCommand(); })
                    const cancelButton = $('<button>').addClass('cancelCommandButton').text('Annuler').on('click', () => { cancelEdit(); })
                    actionButton.append(deleteButton, cancelButton)

                    editCommand(cmd, cmd.id);
                });
            commandsContainer.append(listItem);
        });
    }
}
loadCommands();

function moveRowUp(row) {
    const previousRow = row.prev();  // Obtenir la ligne précédente
    if (previousRow.length > 0) {
        row.insertBefore(previousRow);  // Déplacer la ligne actuelle avant la ligne précédente
    }
}

// Fonction pour déplacer une ligne vers le bas
function moveRowDown(row) {
    const nextRow = row.next();  // Obtenir la ligne suivante
    if (nextRow.length > 0) {
        row.insertAfter(nextRow);  // Déplacer la ligne actuelle après la ligne suivante
    }
}


window.apiReceive.createdAction((event, data) => {
    if (data.isEditMode == true) {
        const actionListBody = $('#action-list tbody')[0];
        console.log(data)
        const rowToEdit = $(actionListBody).find(`tr[action-id="${data.id}"]`);

        if (rowToEdit.length > 0) {
            rowToEdit.find('td').eq(0).text(data.name);
            rowToEdit.find('td').eq(1).text(data.type);
            rowToEdit.find('td').eq(2).text(JSON.stringify(data.details));
        }

        const buttonContainer = $(rowToEdit).find('.action-buttons');
        let modifyButton = buttonContainer.find('button:contains("Modifier")');
        if (modifyButton.length > 0) {
            modifyButton.off('click').on('click', function () {
                let actionData = {
                    id: data.id,
                    name: data.name,
                    type: data.type,
                    details: data.details
                };
                window.api.actionWindow({ page: "command", data: actionData });
            });
        }
        $(rowToEdit).attr("action-name", data.name).attr("action-type", data.type);

        showNotification("Action modifiée avec succès !");
    } else {
        const actionListBody = $('#action-list tbody')[0];
        const actionId = `${Math.floor(Math.random() * 1000000)}-${Math.floor(Math.random() * 1000000)}`
        const row = actionListBody.insertRow();

        row.insertCell(0).textContent = data.name;
        row.insertCell(1).textContent = data.type;
        row.insertCell(2).textContent = JSON.stringify(data.details);

        const buttonContainer = $('<div>').addClass("action-buttons").css({
            display: 'flex',
            gap: '5px'
        });

        const modifyButton = $('<button>')
            .text('Modifier')
            .css({
                padding: '4px 8px',
                margin: 'auto',
                height: '24px',
                width: '190px',
                borderRadius: '5px',
                cursor: 'pointer'
            })
            .on('click', function () {
                let actionData = {
                    id: actionId,
                    name: data.name,
                    type: data.type,
                    details: data.details
                }
                window.api.actionWindow({ page: "command", data: actionData });
            });

        const deleteButton = $('<button>')
            .text('Supprimer')
            .css({
                padding: '4px 8px',
                margin: 'auto',
                height: '24px',
                width: '190px',
                borderRadius: '5px',
                cursor: 'pointer'
            })
            .on('click', function () {
                showNotification("Action supprimée avec succès !");
                $(row).remove();
            });

        const upButton = $('<button>').addClass('move-up').text('↑').css({
            padding: '4px 8px',
            margin: '0',
            height: '34px',
            width: '34px',
            borderRadius: '50%',
            cursor: 'pointer'
        }).on('click', function () {
            moveRowUp(row);
        });

        const downButton = $('<button>').addClass('move-down').text('↓').css({
            padding: '4px 8px',
            margin: '0',
            height: '34px',
            width: '34px',
            borderRadius: '50%',
            cursor: 'pointer'
        }).on('click', function () {
            moveRowDown(row);
        });

        buttonContainer.append(modifyButton, deleteButton, upButton, downButton);
        const actionCell = $('<td>').append(buttonContainer);
        $(row).attr("action-id", actionId).append(actionCell);
        showNotification("Action ajoutée avec succès !");
    }
    window.api.actionWindow({ page: "close" });
})

function addArgument() {
    const argumentList = $('#argument-list');
    const commandType = $('#command-type').val();

    const argumentItem = $('<div>').addClass('argument-item');
    const argOrder = $('<input>').attr('type', 'number').attr('placeholder', 'Ordre');
    const argName = $('<input>').attr('type', 'text').attr('placeholder', "Nom de l'argument");

    const argType = $('<select>');
    ["addStringOption", "addChannelOption", "addBooleanOption", "addRoleOption", "addUserOption", "addIntegerOption"].forEach(type => {
        const option = $('<option>').val(type).text(type);
        argType.append(option);
    });

    if (commandType === "SLASH") {
        const argDescription = $('<input>').attr('type', 'text').attr('placeholder', 'Description de l\'argument');

        const argRequired = $('<input>').attr('type', 'checkbox');
        const requiredLabel = $('<label>').text('Requis').css('margin-right', '10px').append(argRequired);

        argumentItem.append(argOrder, argName, argType, argDescription, requiredLabel);
    } else {
        argumentItem.append(argOrder, argName);
    }

    const deleteButton = $('<button>').text('Supprimer').css('margin-left', '5px').on('click', () => {
        argumentItem.remove();
        showNotification("Argument supprimé avec succès !");
    });

    argumentItem.append(deleteButton);
    argumentList.append(argumentItem);
    showNotification("Argument ajouté avec succès");
}

function selectPermission(phrasePermission, permission) {
    const container = $('#selected-permissions-container');
    const existingPermissions = Array.from(container.children()).map(div => div.textContent.trim());

    const permissionText = $('#dropdown div').filter(function () {
        return $(this).attr('onclick') && $(this).attr('onclick').includes(permission);
    }).text().trim();

    if (!existingPermissions.includes(permissionText)) {
        const permissionDiv = $('<div>').addClass('selected-permission').attr('data-name', permission).text(permissionText)
            .on('click', function () {
                permissionDiv.remove();
            })

        container.append(permissionDiv);
    }

    toggleDropdown();
}

function addCommand() {
    const commandName = $('.command-name').val();
    const commandType = $('.types').val();
    const trigger = $('.trigger').val();

    const selectedPermissions = $('#selected-permissions-container .selected-permission')
        .map(function () {
            return $(this).data('name');
        }).get();

    const arguments1 = [];
    const argumentList = $('#argument-list').children();
    argumentList.each(function () {
        const argOrder = $(this).find("input[type='number']").val();
        const argName = $(this).find("input[type='text']").val();
        let argDescription = null;
        let argRequired = false;

        if (argName) {
            const argument = { name: argName, order: argOrder };

            if (commandType == "SLASH") {
                const argType = $(this).find("select").val();
                argDescription = $(this).find("input[placeholder=\"Description de l'argument\"]").val();
                argRequired = $(this).find("input[type='checkbox']").prop('checked');

                argument.type = argType;
                argument.description = argDescription;
                argument.required = argRequired;
            }

            arguments1.push(argument);
        }
    });

    const actions = [];
    const ActionListBody = $('#action-list tbody')[0];
    $(ActionListBody).find('tr').each(function () {
        const actionName = $(this).find('td').eq(0).text();
        const actionType = $(this).find('td').eq(1).text();
        const actionDetails = JSON.parse($(this).find('td').eq(2).text());
        actions.push({ name: actionName, type: actionType, details: actionDetails });
    });

    if (commandName && commandType && trigger && selectedPermissions.length > 0 && actions.length > 0) {
        if (isEditMode) {
            const commands = { id: currentCommandId, commandName, commandType, trigger, permissions: selectedPermissions, arguments: arguments1, actions };
            window.api.actionComponent({ action: "edit", component: "commands", commands })
                .then((response) => {
                    if (response.success) {
                        showNotification("Commande modifiée avec succès !");
                    } else {
                        showNotification(response.message, true);
                    }
                })
        } else {
            const commands = { id: (parseInt(currentNumberCommandId) + 1).toString(), commandName, commandType, trigger, permissions: selectedPermissions, arguments: arguments1, actions };
            window.api.actionComponent({ action: "save", component: "commands", commands })
                .then((response) => {
                    if (response.success) {
                        showNotification("Commande créé avec succès !");
                    } else {
                        showNotification(response.message, true);
                    }
                })
        }
        cancelEdit();
    } else {
        showNotification("Veuillez remplir tous les champs et ajouter au moins une action.", true);
    }
}

function editCommand(cmd, commandId) {
    $('.command-name').val(cmd.commandName);
    $('.trigger').val(cmd.trigger);
    $('.types').val(cmd.commandType);

    cmd.permissions.forEach(namePermission => {
        selectPermission(null, namePermission);
    });

    $('#argument-list').empty();
    cmd.arguments.forEach(argument => {
        const argumentItem = $('<div>').addClass('argument-item');

        const argName = $('<input>').attr({ type: 'text', placeholder: "Nom de l'argument", value: argument.name });
        const argOrder = $('<input>').attr({ type: 'number', placeholder: 'Ordre', value: argument.order || 0 });
        const argType = $('<select>');
        ["addStringOption", "addChannelOption", "addBooleanOption", "addRoleOption", "addUserOption", "addIntegerOption"].forEach(type => {
            const option = $('<option>').val(type).text(type);
            if (type === argument.type) option.prop('selected', true);
            argType.append(option);
        });

        const argDescription = $('<input>').attr({ type: 'text', placeholder: "Description de l'argument", value: argument.description || "" });
        const argRequired = $('<input>').attr('type', 'checkbox').prop('checked', argument.required);
        const requiredLabel = $('<label>').css('margin-right', '10px').text('Requis').append(argRequired);

        const deleteButton = $('<button>').text('Supprimer').on('click', () => argumentItem.remove());

        if (cmd.commandType === "SLASH") {
            argumentItem.append(argOrder, argName, argType, argDescription, requiredLabel);
        } else {
            argumentItem.append(argOrder, argName);
        }

        argumentItem.append(deleteButton);
        $('#argument-list').append(argumentItem);
    });

    $('#action-list tbody').empty();
    cmd.actions.forEach(action => {
        const actionId = `${Math.floor(Math.random() * 1000000)}-${Math.floor(Math.random() * 1000000)}`
        const row = $('<tr>').attr("action-id", actionId);
        row.append(
            $('<td>').text(action.name),
            $('<td>').text(action.type),
            $('<td>').text(JSON.stringify(action.details))
        );

        const buttonContainer = $('<div>').addClass("action-buttons").css({
            display: 'flex',
            gap: '5px'
        });

        const modifyButton = $('<button>')
            .text('Modifier')
            .css({
                padding: '4px 8px',
                margin: 'auto',
                height: '24px',
                width: '190px',
                borderRadius: '5px',
                cursor: 'pointer'
            })
            .on('click', function () {
                let actionData = {
                    id: actionId,
                    name: action.name,
                    type: action.type,
                    details: action.details
                }
                window.api.actionWindow({ page: "command", data: actionData });
            });

        const deleteButton = $('<button>')
            .text('Supprimer')
            .css({
                padding: '4px 8px',
                margin: 'auto',
                height: '24px',
                width: '190px',
                borderRadius: '5px',
                cursor: 'pointer'
            })
            .on('click', function () {
                showNotification("Action supprimée avec succès !");
                $(row).remove();
            });

        const upButton = $('<button>').addClass('move-up').text('↑').css({
            padding: '4px 8px',
            margin: '0',
            height: '34px',
            width: '34px',
            borderRadius: '50%',
            cursor: 'pointer'
        }).on('click', function () {
            moveRowUp(row);
        });

        const downButton = $('<button>').addClass('move-down').text('↓').css({
            padding: '4px 8px',
            margin: '0',
            height: '34px',
            width: '34px',
            borderRadius: '50%',
            cursor: 'pointer'
        }).on('click', function () {
            moveRowDown(row);
        });

        buttonContainer.append(modifyButton, deleteButton, upButton, downButton);
        const actionCell = $('<td>').append(buttonContainer);
        row.append(actionCell);

        $('#action-list tbody').append(row);
    });

    currentCommandId = commandId;
}

function deleteCommand() {
    window.api.actionComponent({ action: "delete", component: "commands", id: currentCommandId })
        .then((response) => {
            if (response.success) {
                showNotification("Commande supprimée avec succès !");
            } else {
                showNotification(response.message, true);
            }
        })
    cancelEdit()
}

function cancelEdit() {
    isEditMode = false;
    $('.command-name').val('');
    $('.types').val('PREFIX');
    $('.trigger').val('');
    $('#selected-permissions-container').empty();
    $('#argument-list').empty();
    $('#action-list tbody').empty();

    $('.addCommandButton').text('Ajouter la commande');
    $('.deleteCommandButton').remove();
    $('.cancelCommandButton').remove();

    loadCommands();
}

function updateCommandInputs() {
    const commandType = $('#command-type').val();
    const inputElement = $('#command-input');
    const argumentSection = $('#argument-section');

    if (commandType === "PREFIX") {
        inputElement.attr('placeholder', "Déclencheur = '(prefix)ping'");
        argumentSection.show();
    } else {
        inputElement.attr('placeholder', "Commande = 'ping'");
        argumentSection.show();
    }
}

function openActionWindow() {
    window.api.actionWindow({ page: "command" });
}

window.onclick = function (event) {
    const dropdown = $('#dropdown');
    const customSelectContainer = $('.custom-select-container');
    if (!customSelectContainer.is(event.target) && !customSelectContainer.has(event.target).length) {
        dropdown.hide();
    }
}

$(document).ready(function () {
    let draggedRow = null;
    let offsetY = 0;

    // Sélectionner toutes les lignes du tableau
    const rows = $('#action-list tbody tr');

    // Ajout d'un gestionnaire de clic sur chaque ligne du tableau pour commencer le déplacement
    rows.on('mousedown', function (e) {
        draggedRow = $(this); // Sauvegarder la ligne actuellement déplacée
        offsetY = e.clientY - draggedRow.offset().top; // Calculer la distance de la souris au sommet de la ligne
        $(document).on('mousemove', moveRow); // Ajouter l'écouteur de mouvement de la souris
        $(document).on('mouseup', dropRow); // Ajouter l'écouteur de relâchement de la souris
    });

    // Fonction qui déplace la ligne avec la souris
    function moveRow(e) {
        if (draggedRow) {
            // Déplacer la ligne en suivant la souris
            draggedRow.css({
                position: 'absolute',
                zIndex: 1000,
                top: e.clientY - offsetY + 'px',
                left: draggedRow.offset().left + 'px' // Garder la position à gauche de la fenêtre
            });
        }
    }

    // Fonction qui "dépose" la ligne à la bonne position lorsqu'on relâche la souris
    function dropRow(e) {
        if (draggedRow) {
            // Calculer la ligne la plus proche en fonction de la position de la souris
            const rowsBelow = $('#action-list tbody tr');
            let closestRow = null;
            let minDistance = Infinity;

            rowsBelow.each(function () {
                const row = $(this);
                const rect = row[0].getBoundingClientRect();
                const distance = Math.abs(e.clientY - rect.top - rect.height / 2);

                if (distance < minDistance) {
                    closestRow = row;
                    minDistance = distance;
                }
            });

            // Insérer la ligne avant ou après la ligne la plus proche
            if (closestRow) {
                const rect = closestRow[0].getBoundingClientRect();
                if (e.clientY < rect.top + rect.height / 2) {
                    closestRow.before(draggedRow); // Insérer avant
                } else {
                    closestRow.after(draggedRow); // Insérer après
                }
            }

            // Réinitialiser les styles de la ligne déplacée
            draggedRow.css({
                position: 'static',
                top: 'auto',
                left: 'auto',
                zIndex: 'auto'
            });

            // Supprimer les écouteurs d'événements lorsque le déplacement est terminé
            $(document).off('mousemove', moveRow);
            $(document).off('mouseup', dropRow);

            draggedRow = null;
        }
    }
});

