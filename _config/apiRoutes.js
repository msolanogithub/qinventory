const moduleName = 'iinventory';
const moduleVersion = 'v1';
const urlBase = `/${moduleName}/${moduleVersion}`;


export default {
  urlBase: urlBase,
  version: moduleVersion,
  inventories: `${urlBase}/inventories`,
  items: `${urlBase}/inventory-items`,
};
