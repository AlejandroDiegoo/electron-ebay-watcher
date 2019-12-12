
'use strict'

const { ipcRenderer } = require('electron');
const shell = require('electron').shell;
const serializer = new XMLSerializer();
const remote = require('electron').remote;

const showList = () => {
  document.getElementById('list').style.display = 'block';
  document.getElementById('error').style.display = 'none';
};

const showError = () => {
  document.getElementById('list').style.display = 'none';
  document.getElementById('error').style.display = 'flex';
};

ipcRenderer.on('loading', (event, status) => {
  document.getElementById('loading').style.display = status ? 'flex' : 'none';
});

ipcRenderer.on('connection-error', (event) => {
  showError();
});

ipcRenderer.on('items', (event, items) => {
  const list = document.getElementById('list');
  let itemsHtml = '';
  Array.prototype.forEach.call(items, item => {
    let template = document.getElementsByTagName('template')[0].content;
    template = serializer.serializeToString(template);
    template = template.replace(/{{title}}/g, item.title.toUpperCase());
    template = template.replace(/{{image}}/g, item.image);
    template = template.replace(/{{price}}/g, item.price);
    template = template.replace(/{{url}}/g, item.url);
    itemsHtml += template;
  });
  list.innerHTML = itemsHtml;
  showList();
  const links = Array.from(document.querySelectorAll('a'));
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      shell.openExternal(this.getAttribute('href'));
    }, false);
  })
  window.scrollTo(0, 0);
});

document.getElementById('close-button').addEventListener('click', (e) => {
  var window = remote.getCurrentWindow();
  window.close();
}); 

document.getElementById('reconnect-button').addEventListener('click', (e) => {
  ipcRenderer.send('get-items');
});
