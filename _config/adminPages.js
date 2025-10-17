export default {
  inventories: {
    permission: 'iinventory.inventories.manage',
    activated: true,
    authenticated: true,
    path: '/inventory/inventory/index',
    name: 'qinventory.admin.inventories',
    crud : import('modules/qinventory/_crud/inventories'),
    page: () => import('modules/qcrud/_pages/admin/crudPage'),
    layout: () => import('layouts/master.vue'),
    title: 'iinventory.cms.sidebar.adminInventories',
    icon: 'fa-light fa-shelves',
    subHeader: {
      refresh: true,
    }
  },
  inventory: {
    permission: 'iinventory.inventories.manage',
    activated: true,
    authenticated: true,
    path: '/inventory/inventory/show/:id',
    name: 'qinventory.admin.inventories.show',
    page: () => import('modules/qinventory/_pages/inventory'),
    layout: () => import('layouts/master.vue'),
    title: 'iinventory.cms.sidebar.adminInventories',
    icon: 'fa-light fa-shelves',
    subHeader: {
      refresh: true,
      breadcrumb: ['qinventory.inventories']
    }
  }
}
