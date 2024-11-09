let isEditMode = false;

async function loadVariables() {
    const variables = await window.api.loadVariables();
    const variablesContainer = document.getElementById('variables-container');
    variablesContainer.innerHTML = '';

    if (Array.isArray(variables) && variables.length > 0) {
        variables.forEach(vrb => {
            const listItem = document.createElement('div');
            listItem.className = 'variable-item';
            listItem.innerText = `${vrb.variableName} (${vrb.variableValue})`;
            listItem.onclick = () => {
                isEditMode = true;
                //editVariable(vrb); 
            };
            variablesContainer.appendChild(listItem);
        });
    }
}

loadVariables();