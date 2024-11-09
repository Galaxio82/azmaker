const { BrowserWindow, Menu, app, ipcMain, screen } = require('electron');
const ejs = require('ejs-electron');
const DiscordBot = require('./discordClient');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const axios = require('axios');
const keytar = require('keytar');

let splashWindow, mainWindow, actionWindow;
let infoAboutUse = {}; let ActionData = {};
let discordBot = new DiscordBot();

const localDir = path.join(app.getPath('userData'), './Local');
const configPath = path.join(localDir, 'config.json');
const modulesPath = path.join(localDir, 'modules.json');
const commandsPath = path.join(localDir, 'commands.json');
const eventsPath = path.join(localDir, 'events.json');
const variablesPath = path.join(localDir, 'variables.json');

function createLocalFile() {
    if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
    }

    const defaultConfig = {};
    const defaultModules = {
        discord: true
    }
    const defaultCommands = [];
    const defaultEvents = [];
    const defaultVariables = [];

    function createFileIfNotExists(filePath, defaultContent) {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2), 'utf8');
        }
    }

    createFileIfNotExists(configPath, defaultConfig);
    createFileIfNotExists(modulesPath, defaultModules);
    createFileIfNotExists(commandsPath, defaultCommands);
    createFileIfNotExists(eventsPath, defaultEvents);
    createFileIfNotExists(variablesPath, defaultVariables);
}

createLocalFile();

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 530,
        height: 600,
        frame: false,
        resizable: false,
        movable: true,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        },
    });
    splashWindow.loadURL(pathToFileURL(path.join(__dirname, 'views', 'splash.ejs')).toString());
    discordBot.updatePresence("Démarrage de l'application", "En attente d'action");
}

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width,
        height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        }
    });

    mainWindow.loadURL(pathToFileURL(path.join(__dirname, 'views', 'index.ejs')).toString());
    discordBot.updatePresence("Dans le menu principal", "Commandes");

    mainWindow.on('close', (event) => {
        mainWindow.webContents.executeJavaScript('localStorage.clear();')
    });

    mainWindow.on('closed', () => {
        if (actionWindow) {
            actionWindow.close();
        }
        mainWindow = null;
    });
}

function createActionWindow() {
    actionWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        }
    });
    actionWindow.loadURL(pathToFileURL(path.join(__dirname, 'views', 'action.ejs')).toString());
    discordBot.updatePresence("Dans la configuration d'action", "Commandes");
    
    actionWindow.on('closed', () => {
        actionWindow = null;
        if(mainWindow) {
            mainWindow.focus();  
            discordBot.updatePresence("Dans le menu principal", "Commandes");
        }
    });
}

app.whenReady().then(() => {

    discordBot.loginPresence().then(() => {
        createSplashWindow(); 
    }).catch((error) => {
        console.error("Erreur lors de la connexion au Discord RPC :", error);
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0 || mainWindow === null) {
            createWindow();
        }
    });
});

//------------------------------------------------------------------------------------------//

ipcMain.on('navigate-to', (event, page) => {
    mainWindow.loadFile(path.join(__dirname, `views/${page}.ejs`));
});

ipcMain.on('infoAboutUse', (event) => {
    event.sender.send('authentificateRemember-response', infoAboutUse)
})

ipcMain.on('action-window', (event,data) => {
    if(data.page == "command" || data.page == "event") {
        if(data != null) {
            ActionData = {
                page: data.page,
                data: data.data
            };
        } else {
            ActionData = {
                page: data.page
            };   
        }

        if (!actionWindow) {
            createActionWindow();
            actionWindow.show();
        } else {
            actionWindow.close()
            createActionWindow();
            actionWindow.show()
        } 
    } else if(data.page == "close") {
        if (actionWindow) {
            actionWindow.close();
            discordBot.updatePresence("Dans le menu principal", "Commandes");
        } 
    }
});

ipcMain.handle('choice-action', async () => {
    return ActionData;
})

ipcMain.on('create-action', (event, data) => {
    if (mainWindow) {
        mainWindow.webContents.send('created-action', data);
    }
});

ipcMain.handle('load-bot', async (event) => {
    const config = discordBot.loadConfig();
    const configs = {
        token: config.token || '',
        clientSecret: config.clientSecret || '',
        guildId: config.guildId || ''
    }

    return configs
});

ipcMain.on('start-bot', (event, { token, clientSecret, guildId }) => {
    const config = { token, clientSecret, guildId };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    discordBot.startBot(event);
});

ipcMain.on('stop-bot', (event) => { discordBot.stopBot(); });


//------------------------------------------------------------------------------------------//
ipcMain.handle('load-commands', async () => {
    let commands = discordBot.readCommands();
    return commands
});

ipcMain.handle('load-events', async () => {
    let events = discordBot.readEvents();
    return events;
});

ipcMain.handle('load-variables', async () => {
    let variables = discordBot.readVariables();
    return variables;
});

ipcMain.on('load-modules', async (event) => {
    let modules = discordBot.loadModule();
    event.sender.send('modules-loaded', modules);
});

ipcMain.on('save-modules', async (event, module) => {
    fs.writeFileSync(path.join(app.getPath('userData'), './Local/modules.json'), JSON.stringify(module, null, 2));
});

ipcMain.on('save-command', (event, command) => {
    let commands = discordBot.readCommands();
    commands.push(command);
    fs.writeFileSync(path.join(app.getPath('userData'), './Local/commands.json'), JSON.stringify(commands));
});

ipcMain.on('save-event', (event, data) => {
    let events = discordBot.readEvents();
    events.push(data);
    fs.writeFileSync(path.join(app.getPath('userData'), './Local/events.json'), JSON.stringify(events));
});
//------------------------------------------------------------------------------------------//
//------------------------------------------------------------------------------------------//
ipcMain.on('edit-command', (event, updatedCommand) => {
    let commands = discordBot.readCommands();
    const index = commands.findIndex(cmd => cmd.id === updatedCommand.id);

    if (index !== -1) {
        commands[index] = {
            commandName: updatedCommand.commandName,
            commandType: updatedCommand.commandType,
            trigger: updatedCommand.trigger,
            permissions: updatedCommand.permissions,
            arguments: updatedCommand.arguments,
            actions: updatedCommand.actions
        };

        fs.writeFileSync(path.join(app.getPath('userData'), './Local/commands.json'), JSON.stringify(commands));
    } else {
        console.error('Commande non trouvée pour mise à jour :', updatedCommand.id);
    }
});

ipcMain.on('delete-command', (event, commandId) => {
    let commands = discordBot.readCommands();
    const commandIndex = commands.findIndex(cmd => cmd.id === commandId);
    if (commandIndex !== -1) {
        commands.splice(commandIndex, 1);

        commands.sort((a, b) => Number(a.id) - Number(b.id));  // Trier par ID

        commands.forEach((cmd, index) => {
            cmd.id = (index + 1).toString();
        });
        fs.writeFileSync(path.join(app.getPath('userData'), './Local/commands.json'), JSON.stringify(commands));
        console.log('Commande supprimée et IDs réorganisés');
    } else {
        console.error('Commande non trouvée pour suppression :', commandId);
    }
});


ipcMain.on('edit-event', (event, updatedEvent) => {
    let events = discordBot.readEvents();
    const index = events.findIndex(evt => evt.trigger === updatedEvent.currentTrigger);

    if (index !== -1) {
        events[index] = {
            eventName: updatedEvent.eventName,
            eventType: updatedEvent.eventType,
            actions: updatedEvent.actions
        };

        fs.writeFileSync(path.join(app.getPath('userData'), './Local/events.json'), JSON.stringify(events));
    } else {
        console.error('Event non trouvée pour mise à jour :', updatedEvent.currentTrigger);
    }
});

ipcMain.on('delete-event', (event, eventId) => {
    let events = discordBot.readEvents();
    const eventIndex = events.findIndex(evt => evt.id === eventId);
    if (eventIndex !== -1) {
        events.splice(eventIndex, 1);

        events.sort((a, b) => Number(a.id) - Number(b.id));  // Trier par ID

        events.forEach((evt, index) => {
            evt.id = (index + 1).toString();
        });
        fs.writeFileSync(path.join(app.getPath('userData'), './Local/events.json'), JSON.stringify(events));
        console.log('Évènement supprimé et IDs réorganisés');
    } else {
        console.error('Évènement non trouvée pour suppression :', eventId);
    }
});
//------------------------------------------------------------------------------------------//

app.on('before-quit', (event) => {
    discordBot.stopBot();
    if(client) client.destroy();
});

//------------------------------------------------------------------------------------------//
const menuTemplate = [
    // {
    //     label: 'Fichier',
    //     submenu: [
    //         {
    //             label: 'Ouvrir',
    //             accelerator: 'CmdOrCtrl+O',
    //             click: () => {
    //                 console.log('Ouvrir un fichier...');
    //                 // Ajoute ici la logique pour ouvrir un fichier
    //             }
    //         },
    //         {
    //             label: 'Quitter',
    //             accelerator: 'CmdOrCtrl+Q',
    //             click: () => {
    //                 app.quit();
    //             }
    //         }
    //     ]
    // },
    // {
    //     label: 'Édition',
    //     submenu: [
    //         { role: 'undo', label: 'Annuler' },
    //         { role: 'redo', label: 'Refaire' },
    //         { type: 'separator' },
    //         { role: 'cut', label: 'Couper' },
    //         { role: 'copy', label: 'Copier' },
    //         { role: 'paste', label: 'Coller' }
    //     ]
    // },
    {
        label: 'Affichage',
        submenu: [
            { role: 'reload', label: 'Recharger' },
            { role: 'toggledevtools', label: 'Outils de Développement' },
            { type: 'separator' },
            { role: 'togglefullscreen', label: 'Plein écran' }
        ]
    },
    // {
    //     label: 'Aide',
    //     submenu: [
    //         {
    //             label: 'À propos',
    //             click: () => {
    //                 console.log('Afficher des informations sur l’application...');
    //             }
    //         }
    //     ]
    // }
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
//------------------------------------------------------------------------------------------//
