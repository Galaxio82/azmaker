async function logger() {
    const auth = await window.api.infoAboutUse()
    $('#name').html(auth.name)
    $('#email').html(auth.email)
}

function showSection(sectionId) {
    if(sectionId == "Compte") logger();
    const sections = document.querySelectorAll('.box');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionId);
    const MainName = document.getElementById("main-name");
    if (activeSection) {
        MainName.innerHTML = sectionId
        activeSection.style.display = 'block';

    }
}

async function loadModuleSettings() {
    const module = await window.api.loadComponent({ name: "modules", project: false })

    const modulesContainer = document.getElementById('modules-container');
    modulesContainer.innerHTML = '';

    for (let moduleName in module) {
        const moduleDiv = document.createElement('div');

        const label = document.createElement('label');
        label.textContent = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

        const switchLabel = document.createElement('label');
        switchLabel.classList.add('switch');

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `${moduleName}Module`;
        input.checked = module[moduleName];

        const span = document.createElement('span');
        span.classList.add('slider');

        switchLabel.appendChild(input);
        switchLabel.appendChild(span);

        moduleDiv.appendChild(label);
        moduleDiv.appendChild(switchLabel);

        modulesContainer.appendChild(moduleDiv);

        input.addEventListener('change', saveAllModuleSettings);
    }
}

function saveAllModuleSettings() {
    const modules = {};

    const moduleNames = ['discord', 'mysql'];
    moduleNames.forEach(moduleName => {
        const moduleInput = document.getElementById(`${moduleName}Module`);
        if (moduleInput) {
            modules[moduleName] = moduleInput.checked;
        }
    });

    window.api.saveModules(modules)
}


showSection('Compte');
loadModuleSettings();