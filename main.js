
'use strict'

const configUrl = 'https://www.ebay.es/sch/i.html?_odkw=coleccionismo&LH_PrefLoc=1&_sop=10&LH_BIN=1&_osacat=0&_from=R40&_trksid=p2045573.m570.l1313.TR12.TRC2.A0.H0.Xsellos.TRS0&_nkw=sellos&_sacat=0';
const configConnectionTime = 55000;
const configAttempts = 5;
const configAttemptsTime = 5000;

const path = require('path');
const { app, ipcMain } = require('electron');
const cheerio = require('cheerio');
const request = require('request');
const Window = require('./window');
const DataStore = require('./data-store');
const dataStore = new DataStore({ name: 'items' });
const electroReload = require('electron-reload')(__dirname);

const main = () => {
  let mainWindow = new Window({
    file: path.join('static', 'index.html')
  });
  mainWindow.once('show', () => {
    mainWindow.webContents.send('items', dataStore.get('items') || []);
    consolePrint('STARTING APP...');
    getNewItems(mainWindow);
  });
  ipcMain.on('get-items', () => {
    consolePrint('NEW ITEMS REQUESTED');
    getNewItems(mainWindow);
  });
}

const getNewItems = (window, attempts = configAttempts) => {
  consolePrint('CONNECTING WITH URL...');
  window.webContents.send('loading', true);
  request(configUrl, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(body);
      const items = [];
      $('ul#ListViewInner li.sresult').each(function(i, e) {
        items.push({
          title: $(this).find('h3.lvtitle').text(),
          url: $(this).find('h3.lvtitle a').attr('href'),
          price: $(this).find('.lvprice span').text(),
          ship: $(this).find('.lvshipping .ship').text(),
          image: $(this).find('img').attr('src')
        });
      });
      window.webContents.send('items', dataStore.saveItems(items));
      setTimeout(() => getNewItems(window), configConnectionTime);
      window.webContents.send('loading', false); 
      consolePrint('ITEMS SUCCESSFULLY RECEIVED');
      consolePrint('NEW CONNECTION IN ' + parseInt(configConnectionTime / 1000) + ' SECONDS');
    } else if (attempts > 0) {
      consolePrint('CONNECTION FAILED');
      consolePrint('NEW ATTEMPT IN ' + parseInt(configAttemptsTime / 1000) + ' SECONDS');
      setTimeout(() => getNewItems(window, attempts - 1), configAttemptsTime); 
    } else {
      consolePrint('CONNECTION FAILED');
      window.webContents.send('loading', false);
      window.webContents.send('connection-error');
    }
  });
}

const consolePrint = (message) => {
  let currentdate = new Date(); 
  let datetime = '[' + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds() + "] " ;
                console.log(datetime + message);
}

app.on('ready', main);

app.on('window-all-closed', () => {
  app.quit();
});
