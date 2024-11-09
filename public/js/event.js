let isEditMode = false;
$('.type').val('guildCreate');
let currentNumberEventId;

async function loadEvents() {
    const events = await window.api.loadEvents();
    const eventsContainer = $('#events-container');
    eventsContainer.empty();

    currentNumberEventId = Math.max(...events.map(evt => Number(evt.id) || 1))

    if (Array.isArray(events) && events.length > 0) {
        events.forEach(evt => {
            const listItem = $('<div>')
                .addClass('event-item')
                .text(`${evt.eventName} (${evt.eventType})`)
                .on('click', () => {
                    cancelEdit();
                    isEditMode = true;
                    $('#selected-permissions-container').empty();
                    const actionButton = $('.event-buttons'); $('.addEventButton').text("Modifier l'évènement");
                    const deleteButton = $('<button>').addClass('deleteEventButton').text("Supprimer l'évènement").on('click', () => { deleteEvent();  })
                    const cancelButton = $('<button>').addClass('cancelEventButton').text('Annuler').on('click', () => { cancelEdit(); })
                    actionButton.append(deleteButton, cancelButton)

                    editEvent(evt, evt.id);
                });
            eventsContainer.append(listItem);
        });
    }
}

loadEvents();

window.apiReceive.createdAction((event, data) => {
    if(data.isEditMode == true) {
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
                actionData = {
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
            gap: '5px',
        });
    
        const modifyButton = $('<button>')
        .text('Modifier')
        .css({
            padding: '3px 5px',
            fontSize: '10px',
        })
        .on('click', function () {
            actionData = {
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
            padding: '3px 5px',
            fontSize: '10px',
        })
        .on('click', function () {
            showNotification("Action supprimée avec succès !");
            $(row).remove();
        });
    
        buttonContainer.append(modifyButton, deleteButton);
        const actionCell = $('<td>').append(buttonContainer);
        $(row).attr("action-id", actionId).append(actionCell);
        showNotification("Action ajoutée avec succès !");
    }

    window.api.actionWindow({ page: "close" });
})

function addEvent() {
    const eventName = $('.event-name').val();
    const eventType = $('.type').val();

    const actions = [];
    const ActionListBody = document.getElementById('action-list').getElementsByTagName('tbody')[0];
    for (let i = 0; i < ActionListBody.rows.length; i++) {
        const row = ActionListBody.rows[i];
        const actionName = row.cells[0].textContent;
        const actionType = row.cells[1].textContent;
        const actionDetails = JSON.parse(row.cells[2].textContent);
        actions.push({ name: actionName, type: actionType, details: actionDetails });
    }

    if (eventName && eventType && actions.length > 0) {
        if(isEditMode) {
            const event = { id: currentNumberEventId, eventName, eventType, actions };
            window.api.editEvent(event);
            showNotification("Évènement modifié avec succès")
        } else {
            const event = { id: currentNumberEventId, eventName, eventType, actions };
            window.api.saveEvent(event);
            showNotification("Évènement créé avec succès")
        }

        loadEvents();
        cancelEdit();
    } else {
        return showNotification("Veuillez remplir tous les champs et ajouter au moins une action", true);
    }
}

function editEvent(evt, eventId) {
    $('.event-name').val(evt.eventName);
    $('.type').val(evt.eventType)

    $('#action-list tbody').empty();
    evt.actions.forEach(action => {
        const actionId = `${Math.floor(Math.random() * 1000000)}-${Math.floor(Math.random() * 1000000)}`
        const row = $('<tr>').attr("action-id", actionId);
        row.append(
            $('<td>').text(action.name),
            $('<td>').text(action.type),
            $('<td>').text(JSON.stringify(action.details))
        );

        const buttonContainer = $('<div>').addClass("action-buttons").css({ display: 'flex', gap: '5px' });

        const modifyButton = $('<button>').text('Modifier').css({ padding: '3px 5px', fontSize: '10px' }).on('click', () => {
            actionData = {
                id: actionId,
                name: action.name,
                type: action.type,
                details: action.details

            }
            window.api.actionWindow({ page: "command", data: actionData });
        });

        const deleteButton = $('<button>').text('Supprimer').css({ padding: '3px 5px', fontSize: '10px' }).on('click', () => {
            showNotification("Action supprimée avec succès !");
            row.remove();
        });

        buttonContainer.append(modifyButton, deleteButton);
        const actionCell = $('<td>').append(buttonContainer);
        row.append(actionCell);

        $('#action-list tbody').append(row);
    });

    currentEventId = eventId;
}

function deleteEvent() {
    window.api.deleteEvent(currentEventId);
    cancelEdit()
    showNotification("Évènement supprimé avec succès !");
}

function cancelEdit() { 
    isEditMode = false; 
    $('.event-name').val('');
    $('.type').val('guildCreate');
    $('#action-list tbody').empty();

    $('.addEventButton').text("Ajouter l'évènement");
    $('.deleteEventButton').remove();
    $('.cancelEventButton').remove();

    loadEvents();
}

function openActionWindow() {
    window.api.actionWindow({ page: "event" });
}
