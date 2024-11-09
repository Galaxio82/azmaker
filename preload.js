const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  navigateTo: (page) => ipcRenderer.send('navigate-to', page),

  authentificate: (data) => ipcRenderer.send('authentificate', data),
  authentificateRemember: () => ipcRenderer.send('authentificateRemember'),
  infoAboutUse: () => ipcRenderer.send('infoAboutUse'),

  loadCommands: () => ipcRenderer.invoke('load-commands'),
  loadEvents: () => ipcRenderer.invoke('load-events'),
  loadVariables: () => ipcRenderer.invoke('load-variables'),

  loadModules: () => ipcRenderer.send('load-modules'),
  saveModules: (modules) => ipcRenderer.send('save-modules', modules), 

  saveCommand: (command) => ipcRenderer.send('save-command', command),
  editCommand: (updatedCommand) => ipcRenderer.send('edit-command', updatedCommand),
  deleteCommand: (commandId) => ipcRenderer.send('delete-command', commandId),

  saveEvent: (data) => ipcRenderer.send('save-event', data),
  editEvent: (updatedEvent) => ipcRenderer.send('edit-event', updatedEvent),
  deleteEvent: (eventId) => ipcRenderer.send('delete-event', eventId),

  actionWindow: (data) => ipcRenderer.send('action-window', data),
  createAction: (data) => ipcRenderer.send('create-action', data),
  choiceAction: (data) => ipcRenderer.invoke('choice-action', data),

  loadBot: () => ipcRenderer.invoke('load-bot'),
  startBot: (token, clientSecret, guildId) => ipcRenderer.send('start-bot', { token, clientSecret, guildId }),
  stopBot: () => ipcRenderer.send('stop-bot')
})

contextBridge.exposeInMainWorld('apiReceive', {

  receiveAuthentificate: (callback) => ipcRenderer.on('authentificate-response', callback),
  receiveAuthentificateRemember: (callback) => ipcRenderer.on('authentificateRemember-response', callback),

  receiveModules: (callback) => ipcRenderer.on('modules-loaded', callback),

  receiveBotInfo: (callback) => ipcRenderer.on('bot-info', callback),
  receiveBotError: (callback) => ipcRenderer.once('bot-error', (event, errorMessage) => callback(event, errorMessage)),

  createdAction: (callback) => ipcRenderer.on('created-action', callback),
})

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
})