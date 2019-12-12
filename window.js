
'use strict'

const { BrowserWindow } = require('electron')

const defaultProps = {
  width: 300,
  height: 500,
  'minHeight': 500,
  'minWidth': 300,
  'maxWidth': 300,
  'maxHeight': 700,
  show: false,
  frame: false,
  transparent: true,
  resizable: true,
  webPreferences: {
    nodeIntegration: true
  }
};

class Window extends BrowserWindow {
  constructor ({ file, ...windowSettings }) {
    super({ ...defaultProps, ...windowSettings });
    this.loadFile(file);
    this.once('ready-to-show', () => {
      this.show();
    });
  }
}

module.exports = Window;
