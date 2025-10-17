<template></template>
<script>
export default {
  data() {
    return {
      crudId: this.$uid()
    };
  },
  computed: {
    crudData() {
      return {
        crudId: this.crudId,
        apiRoute: 'apiRoutes.qinventory.inventories',
        permission: 'iinventory.inventories',
        create: {
          title: this.$tr('iinventory.cms.newInventory')
        },
        read: {
          showAs: 'grid',
          columns: [
            { name: 'id', label: this.$tr('isite.cms.form.id'), field: 'id', style: 'width: 50px', align: 'left' },
            { name: 'title', label: this.$tr('isite.cms.form.title'), field: 'title', align: 'left' },
            {
              name: 'quantity',
              label: this.$tr('isite.cms.form.quantity'),
              field: 'quantity',
              format: val => this.$trn(val)
            },
            {
              name: 'created_at', label: this.$tr('isite.cms.form.createdAt'), field: 'createdAt', align: 'left',
              format: val => val ? this.$trd(val) : '-'
            },
            { name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'left' }
          ],
          requestParams: { include: 'translations,files' },
          actions: [
            {
              name: 'show',
              icon: 'fa-light fa-boxes-stacked',
              color: 'primary',
              label: 'Administrar',
              action: (i) => {
                this.$router.push({
                  name: 'qinventory.admin.inventories.show',
                  params: { id: i.id }
                });
              }
            }
          ]
        },
        update: {
          title: this.$tr('iinventory.cms.updateInventory'),
          requestParams: { include: 'translations,options' }
        },
        delete: false,
        formLeft: {
          id: { value: '' },
          userId: { value: this.$store.state.quserAuth.userId },
          title: {
            value: '',
            type: 'input',
            props: {
              label: `${this.$tr('isite.cms.form.title')}*`,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ]
            }
          }
        }
      };
    },
    //Crud info
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {};
    }
  }
};
</script>
