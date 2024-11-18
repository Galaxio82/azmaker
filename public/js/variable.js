let isEditMode = false;

let currentNumberVariableId;
let currentVariableId;

async function loadVariables() {
    const variables = await window.api.loadComponent({ name: "variables", project: true });
    const variablesContainer = $('#variables-container');
    variablesContainer.empty();

    currentNumberVariableId = Math.max(0, ...variables.map(vrb => Number(vrb.id) || 0));

    if (Array.isArray(variables) && variables.length > 0) {
        variables.forEach(vrb => {
            const listItem = $('<div>')
                .addClass('command-item')
                .text(`${vrb.variableName} (${vrb.variableValue})`)
                .on('click', () => {
                    cancelEdit();
                    isEditMode = true;
                    editVariable(vrb, vrb.id);
                });
            variablesContainer.append(listItem);
        });
    }
}

loadVariables();

function addVariable() {
    const key = $('#variable-key').val();
    const value = $('#variable-value').val();

    if (!key) {
        return showNotification('Veuillez entrer un nom de variable', true);
    }

    if (isEditMode) {
        const variables = { id: currentVariableId, variableName: key, variableValue: value, };
        window.api.actionComponent({ action: "edit", component: "variables", variables });
    } else {
        const variables = { id: (parseInt(currentNumberVariableId) + 1).toString(), variableName: key, variableValue: value };
        window.api.actionComponent({ action: "save", component: "variables", variables });
    }

    cancelEdit();
}

function editVariable(vrb, variableId) {
    $('#variable-key').val(vrb.variableName);
    $('#variable-value').val(vrb.variableValue);

    currentVariableId = variableId;
}

function cancelEdit() {
    $('#variable-key').val('');
    $('#variable-value').val('');
    isEditMode = false;
    loadVariables();
}

function deleteVariable() {
    window.api.actionComponent({ action: "delete", component: "variables", id: currentVariableId })
        .then((response) => {
            if (response.success) {
                showNotification("Variable supprimée avec succès !");
            } else {
                showNotification(response.message, true);
            }
        })
    cancelEdit()
}