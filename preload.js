const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  navigateTo: (page) => ipcRenderer.send('navigate-to', page),

  authentificate: (data) => ipcRenderer.send('authentificate', data),
  authentificateRemember: () => ipcRenderer.invoke('authentificateRemember'),
  infoAboutUse: () => ipcRenderer.invoke('infoAboutUse'),

  loadComponent: (component) => ipcRenderer.invoke('load-component', component),

  saveModules: (modules) => ipcRenderer.send('save-modules', modules), 

  actionComponent: (component) => ipcRenderer.invoke('action-component', component),

  actionWindow: (data) => ipcRenderer.send('action-window', data),
  createAction: (data) => ipcRenderer.send('create-action', data),
  choiceAction: (data) => ipcRenderer.invoke('choice-action', data),

  loadBot: () => ipcRenderer.invoke('load-bot'),
  startBot: (token, clientSecret, guildId) => ipcRenderer.send('start-bot', { token, clientSecret, guildId }),
  stopBot: () => ipcRenderer.send('stop-bot'),

  projectInfo: (project) => ipcRenderer.send('project-info', project),
})

contextBridge.exposeInMainWorld('apiReceive', {
  receiveModules: (callback) => ipcRenderer.on('modules-loaded', callback),
  receiveBotStatus: (callback) => ipcRenderer.on('bot-status', callback),
  createdAction: (callback) => ipcRenderer.on('created-action', callback),
  receiveProject: (callback) => ipcRenderer.on('receive-project', callback)
})

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
})