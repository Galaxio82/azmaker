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

    switch(actionType) {
        case "sendMessage":
            actionDetails = { name: actionName, type: 'sendMessage', details: $('#message-content').val() };
            break;

        case "sendEmbed":
            const embedDetails = {
                title: $('#embed-title').val() || null,
                description: $('#embed-description').val() || null,
                color: $('#embed-color').val() || null,
                footer: $('#embed-footer').val() || null,
                image: $('#embed-image').val() || null,
                thumbnail: $('#embed-thumbnail').val() || null,
                author: $('#embed-author').val() || null,
                authorIcon: $('#embed-author-icon').val() || null,
                url: $('#embed-url').val() || null
            };
    
            actionDetails = { name: actionName, type: 'sendEmbed', details: embedDetails };
            break;

        case "createCategory":
            actionDetails = { name: actionName, type: 'createCategory', details: { name: $('#category-name').val() }};
            break;

        case "deleteCategory":
            actionDetails = { name: actionName, type: 'deleteCategory', details: { id: $('#category-id').val() }};
            break;

        case "createRole":
            actionDetails = { name: actionName, type: 'createRole', details: { name: $('#role-name').val(), color: $('#role-color').val() }};
            break;

        case "createChannel":
            actionDetails = { name: actionName, type: 'createChannel', details: { name: $('#channel-name').val(), type: $('#channel-type').val() }};
            break;

        case "deleteChannel":
            actionDetails = { name: actionName, type: 'deleteChannel', details: { id: $('#channel-id').val() }};
            break;
    }

    if (actionName && actionDetails.type) {
        if (Object.keys(currentActionData).length > 0) {
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

    switch (data.type) {
        case "sendMessage":
            $('#message-content').val(data.details);
            break;
        case "sendEmbed":
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
            break;

        case "createCategory":
            $('#category-name').val(data.details.name)
            break;

        case "deleteCategory":
            $('#category-name').val(data.details.id)
            break;

        case "createRole":
            $('#role-name').val(data.details.name);
            $('#role-color').val(data.details.color);
            break;

        case "createChannel":
            $('#channel-name').val(data.details.name)
            $('#channel-type').val(data.details.type)
            break;

        case "deleteChannel":
            $('#channel-id').val(data.details.id)
            break;
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

    variable();
}

function setEditMode(isEditMode, name, type) {
    const indicator = $('#edit-mode-indicator');
    const editText = $('#edit-mode-text');
    const description = $('#edit-mode-description');

    if (isEditMode) {
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
    window.close();
}

const dropdown = document.getElementById("variable-dropdown");
const searchInput = document.getElementById("dropdown-search");
const categorySelect = document.getElementById("category-select");
let currentInput = null;
let cursorPosition = 0;
function variable() {
    const textareas = [
        ...document.querySelectorAll("input"),
        ...document.querySelectorAll("textarea")
    ];

    async function loadCustomVariables() {
        const variables = await window.api.loadComponent({ name: "variables", project: false });

        const customCategoryList = document.querySelector('.category[data-category="custom"] ul');
        customCategoryList.innerHTML = '';
    
        if (variables && Array.isArray(variables)) {
            variables.forEach(variable => {
                const li = document.createElement('li');
                li.setAttribute('data-variable', variable.variableName);
                li.textContent = variable.variableName;
                customCategoryList.appendChild(li);
            });
        }
    }

    function generateCategorySelect() {
        const categories = document.querySelectorAll('.category');
        categories.forEach(category => {
            const categoryName = category.getAttribute('data-category');
            const categoryTitle = category.querySelector('h4').textContent;
            
            const option = document.createElement('option');
            option.value = categoryName;
            option.textContent = categoryTitle;
    
            categorySelect.appendChild(option);
        });
    
        categorySelect.value = "all";
    }

    loadCustomVariables();
    generateCategorySelect();

    textareas.forEach(textarea => {
        if (textarea.id == "dropdown-search" || textarea.id == "action-name" || textarea.className == "color-input") return;

        textarea.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            cursorPosition = textarea.selectionStart;
            dropdown.style.display = "block";
            dropdown.scrollTop = 0;

            categorySelect.value = "all";
            loadCustomVariables();
            filterDropdown("");

            let dropdownLeft = event.pageX;
            let dropdownTop = event.pageY;

            const dropdownWidth = dropdown.offsetWidth;
            const dropdownHeight = dropdown.offsetHeight;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            if (dropdownLeft + dropdownWidth > windowWidth) {
                dropdownLeft = windowWidth - dropdownWidth;
            }

            if (dropdownTop + dropdownHeight > windowHeight) {
                dropdownTop = windowHeight - dropdownHeight;
            }

            dropdown.style.left = `${dropdownLeft}px`;
            dropdown.style.top = `${dropdownTop}px`;
            currentInput = textarea;
        });

        searchInput.addEventListener("input", filterDropdown);
        categorySelect.addEventListener("change", filterDropdown);

        textarea.addEventListener("keydown", (event) => {
            const cursor = textarea.selectionStart;
            const text = textarea.value;

            if (event.key === "Backspace" || event.key === "Delete") {
                const match = findVariableAtCursor(cursor, text);
                if (match) {
                    event.preventDefault();
                    const before = text.slice(0, match.start);
                    const after = text.slice(match.end);
                    textarea.value = before + after;

                    cursorPosition = match.start;
                    textarea.setSelectionRange(cursorPosition, cursorPosition);
                }
            }
        });
    })
}

document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
        dropdown.style.display = "none";
        searchInput.value = "";
        filterDropdown("");
    }
});

dropdown.addEventListener("click", (event) => {
    const li = event.target.closest("li");
    if (li) {
        const variable = li.getAttribute("data-variable");
        insertVariable(`{{${variable}}}`);
        dropdown.style.display = "none";
    }
});

function filterDropdown() {
    const searchQuery = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    const categories = dropdown.querySelectorAll(".category");

    categories.forEach((category) => {
        const categoryName = category.getAttribute("data-category");

        // Si on recherche dans une catégorie spécifique
        if (selectedCategory !== "all" && selectedCategory !== categoryName) {
            category.style.display = "none";
        } else {
            // Afficher ou cacher la catégorie en fonction de la recherche
            const items = category.querySelectorAll("li");
            let categoryHasVisibleItems = false;

            items.forEach((item) => {
                const itemText = item.textContent.toLowerCase();
                if (itemText.includes(searchQuery)) {
                    item.style.display = "block";
                    categoryHasVisibleItems = true;
                } else {
                    item.style.display = "none";
                }
            });

            // Afficher la catégorie si elle contient des éléments visibles
            category.style.display = categoryHasVisibleItems ? "block" : "none";
        }
    });
}

function insertVariable(variable) {
    if (currentInput) {
        const text = currentInput.value;
        const before = text.substring(0, cursorPosition);
        const after = text.substring(cursorPosition);

        currentInput.value = `${before}${variable} ${after}`;
        cursorPosition += variable.length + 1;
        currentInput.setSelectionRange(cursorPosition, cursorPosition);
    }
}

function findVariableAtCursor(cursor, text) {
    const regex = /\{\{(\w+?)\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = regex.lastIndex;

        if (cursor > start && cursor <= end) {
            return { start, end };
        }
    }
    return null;
}