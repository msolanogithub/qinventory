<template>
  <div id="pageId">
    <page-actions
      :title="`Inventario | ${inventory?.title ?? '-'}`"
      class="q-mb-md"
      @refresh="getInventory"
    />

    <div class="box box-auto-height q-mb-md">
      <div class="box-title q-mb-md row justify-between items-center">
        <div>
          <q-icon name="fa-light fa-filter" class="q-mr-sm" />
          Filtros
        </div>
        <dynamic-field
          v-model="action"
          :field="dynamicFields.action"
          @update:modelValue="getInventory"
        />
      </div>
      <div class="row q-col-gutter-md">
      </div>
    </div>

    <div class="relative-position">
      <q-table
        flat bordered separator="cell"
        :rows="items"
        :columns="columns"
        row-key="id"
        hide-pagination
        :pagination="pagination"
      >
        <template v-slot:body-cell-shoe="props">
          <td-shoe :shoe="props.value" :selected-options="props.row.options" />
        </template>

        <template v-slot:body-cell="props">
          <q-td :props="props">
            <div v-if="sizeRange.includes(props.col.name)">
              <span
                v-if="action == 'summary' || (action == 'remove' && !props.value)"
                :class="props.value ? 'text-blue text-bold' : 'text-blue-grey'"
              >
                {{ props.value }}
              </span>
              <div v-else>
                <span
                  v-if="action == 'add'"
                  :class="props.row.sizesModel[props.col.name] ? 'text-orange text-bold' : 'text-blue-grey'"
                >
                  {{ props.row.sizesModel[props.col.name] }}
                </span>
                <div v-else>
                  <span
                    :class="Number(props.row.sizesModel[props.col.name]) ? 'text-orange text-bold' : 'text-blue-grey'">
                    {{ props.row.sizesModel[props.col.name] }}
                  </span>
                  <span :class="props.value ? 'text-blue text-bold' : 'text-blue-grey'">
                    / {{ props.value }}
                  </span>
                </div>
                <q-popup-edit
                  v-model="props.row.sizesModel[props.col.name]"
                  color="blue-grey"
                  v-slot="scope"
                >
                  <div class="text-blue-grey q-mb-sm">
                    {{ props.row.shoe.title }}
                  </div>
                  <q-input
                    v-model="scope.value"
                    color="blue-grey"
                    :label="`Talla ${props.col.name}`"
                    outlined autofocus
                    @keyup.enter="() => {
                      const value = Number(scope.value)
                      scope.value = value;
                      if(!value || !Number.isInteger(value) || value < 0) scope.value = 0;
                      if(this.action == 'remove' && scope.value > props.value) scope.value = props.value;
                      scope.set()
                      setTotalToRow(props.row, props.rowIndex)
                    }"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    step="1"
                    hint="Presiona Enter para guardar"
                  />
                  <div
                    v-if="action == 'remove' && scope.value > props.value"
                    class="text-red q-mt-md"
                  >
                    <q-icon name="fa-light fa-triangle-exclamation" />
                    El valor ingresado no puede ser mayor a la existencia actual,
                    se cambiara a <b>{{ props.value }}</b>
                  </div>
                </q-popup-edit>
              </div>
            </div>
            <div v-else-if="props.col.name == 'total'">
              <div v-if="action != 'summary'">
                <div class="row q-gutter-sm">
                  <q-btn
                    v-if="action == 'add'"
                    rounded dense unelevated no-caps
                    icon="fa-light fa-arrow-up-to-line"
                    color="green" class="full-width"
                    :disabled="!props.row.sizesModelQuantity"
                    :label="`Entrada (${props.row.sizesModelQuantity})`"
                    @click="moveInventory(props.row, 'add')"
                  />
                  <q-btn
                    v-if="action == 'remove'"
                    rounded dense unelevated no-caps
                    icon="fa-light fa-arrow-down-from-line"
                    color="orange" class="full-width"
                    :disabled="!props.row.sizesModelQuantity"
                    :label="`Salida (${props.row.sizesModelQuantity})`"
                    @click="moveInventory(props.row, 'remove')"
                  />
                </div>
              </div>
              <div v-else>
                <q-btn
                  v-if="!props.row.quantity"
                  rounded dense unelevated no-caps
                  icon="fa-light fa-trash-can"
                  color="red-2"
                  label="Eliminar"
                  @click="deleteItem(props.row)"
                />
                <span v-else>{{ props.value }}</span>
              </div>
            </div>
            <div v-else>{{ props.value }}</div>
          </q-td>
        </template>

        <template v-if="action == 'summary'" v-slot:bottom-row>
          <q-tr class="bg-grey-1 text-bold">
            <q-td :colspan="1" class="text-blue-grey text-right">Totales</q-td>
            <q-td
              v-for="size in sizeRange"
              :key="`tot-${size}`"
              :class="sizeTotals.bySize[size] ? 'text-blue' : 'text-blue-grey'"
            >
              {{ $trn(sizeTotals.bySize[size]) }}
            </q-td>
            <q-td class="text-center text-blue text-bold">
              {{ $trn(sizeTotals.grand) }}
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <q-btn
        color="blue"
        outline rounded
        no-caps class="full-width q-mt-md"
        icon="fa-light fa-plus"
        label="Agregar Referencia"
        @click="formAddReference.show = true"
      />

      <q-dialog v-model="formAddReference.show" persistent>
        <q-card style="max-width: 450px">
          <q-card-section>
            <div class="text-h6">Agregar Referencia</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <dynamic-field
              v-model="formAddReference.shoe"
              :field="dynamicFields.shoe"
              @update:modelValue="value => formAddReference.options = value.options.map(i => i.id)"
            />
            <dynamic-field
              v-model="formAddReference.options"
              :field="dynamicFields.shoeOptions"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn
              flat
              no-caps
              label="Cancelar"
              color="blue-grey"
              v-close-popup
            />
            <q-btn
              unelevated
              rounded
              no-caps
              label="Agregar"
              color="positive"
              :disable="!formAddReference.shoe"
              v-close-popup
              @click="setReference"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <inner-loading :visible="loading" />
    </div>
  </div>
</template>
<script>
import { tdShoe } from 'modules/qfulfillment/_components/tdTable';

export default {
  props: {},
  components: { tdShoe },
  watch: {},
  mounted() {
    this.$nextTick(function() {
      this.init();
    });
  },
  data() {
    return {
      loading: false,
      inventoryId: this.$route.params.id,
      inventory: null,
      action: 'summary',
      items: [],
      sizes: { min: 33, max: 46 },
      pagination: {
        page: 1,
        rowsPerPage: 0
      },
      formAddReference: {
        show: false,
        shoe: null,
        options: []
      },
      loadedShoeOptions: [],
      movingItemId: null
    };
  },
  computed: {
    columns() {
      let columns = [
        {
          name: 'shoe',
          label: 'Referencia',
          field: 'shoe',
          align: 'left'
        }
      ];

      for (let i = this.sizes.min; i <= this.sizes.max; i++) {
        columns.push({
          name: i, label: i, field: i, align: 'center'
        });
      }

      columns.push({
        name: 'total',
        label: 'Total',
        field: 'quantity',
        align: 'center',
        classes: 'bg-grey-1 text-bold text-blue-grey'
      });

      return columns;
    },
    sizeRange() {
      const arr = [];
      for (let i = this.sizes.min; i <= this.sizes.max; i++) arr.push(i);
      return arr;
    },
    // Totales por talla (columna) y total general
    sizeTotals() {
      const totals = {};
      this.sizeRange.forEach(size => (totals[size] = 0));
      let grand = 0;
      this.items.forEach(row => {
        this.sizeRange.forEach(size => {
          const v = Number(row[size] || 0);
          totals[size] += v;
          grand += v;
        });
      });

      return { bySize: totals, grand };
    },
    dynamicFields() {
      return {
        action: {
          type: 'select',
          props: {
            label: 'Acción',
            options: [
              {
                label: 'Consolidado',
                value: 'summary',
                icon: 'fa-light fa-shelves',
                color: 'info'
              },
              {
                label: 'Salida',
                value: 'remove',
                icon: 'fa-light fa-arrow-down-from-line',
                color: 'orange'
              },
              {
                label: 'Entrada',
                value: 'add',
                icon: 'fa-light fa-arrow-up-to-line',
                color: 'green'
              }
            ]
          }
        },
        shoe: {
          type: 'select',
          props: {
            label: 'Referencia',
            emitValue: false
          },
          loadOptions: {
            apiRoute: 'apiRoutes.qshoe.shoes',
            requestParams: {
              include: 'translations,options.translations'
            },
            select: {
              label: 'reference',
              id: 'id',
              sublabel: 'title'
            }
          }
        },
        shoeOptions: {
          type: 'treeSelect',
          props: {
            label: this.$trp('isite.cms.form.option'),
            multiple: true,
            disableBranchNodes: true,
            disable: !this.formAddReference.shoe
          },
          loadOptions: {
            apiRoute: 'apiRoutes.qshoe.options',
            requestParams: { include: 'parent.translations,translations' },
            select: {
              label: (row) => {
                if (row.parent) return `[${row.parent.title}] ${row.title}`;
                return row.title;
              },
              id: 'id'
            },
            loadedOptions: options => this.loadedShoeOptions = options
          }
        }
      };
    }
  },
  methods: {
    init() {
      this.getInventory();
    },
    //Get data
    getInventory() {
      return new Promise((resolve, reject) => {
        this.loading = true;
        //Requets params
        let requestParams = {
          refresh: true,
          params: {
            include: [
              'items.shoe.translations',
              'items.shoe.options'
            ].join(',')
          }
        };
        //Request
        this.$crud.show(
          'apiRoutes.qinventory.inventories',
          this.inventoryId,
          requestParams
        ).then(response => {
          this.inventory = response.data;
          this.mapItems(response.data.items);
          this.loading = false;
        }).catch(error => {
          this.loading = false;
        });
      });
    },
    mapItems(items) {
      const mappedItems = items.map(item => {
        item.sizesModel = {};
        let currentItem = this.items.find(i => i.id == item.id);
        for (let i = this.sizes.min; i <= this.sizes.max; i++) {
          const itemSize = item?.sizes?.find(s => s.size == i);
          item[i] = itemSize ? itemSize.quantity : 0;
          if(this.movingItemId && this.movingItemId != item.id) {
            item.sizesModel[i] = currentItem.sizesModel[i] || 0;
            item.sizesModelQuantity = currentItem.sizesModelQuantity || 0;
          } else {
            item.sizesModel[i] = 0;
            item.sizesModelQuantity = 0;
          }
        }
        return item;
      });

      this.movingItemId = null;
      this.items = mappedItems;
    },
    setReference() {
      const options = this.loadedShoeOptions.filter(i => this.formAddReference.options.includes(i.id.toString()));
      this.$crud.create('apiRoutes.qinventory.items', {
        inventory_id: this.inventoryId,
        shoe_id: this.formAddReference.shoe.id,
        sizes: {},
        options
      }).then(response => {
        this.formAddReference.show = false;
        this.formAddReference.shoe = null;
        this.formAddReference.options = [];
        this.getInventory();
        this.$alert.info({ message: `${this.$tr('isite.cms.message.recordCreated')}` });
      }).catch(error => {
        this.$alert.error({ message: `${this.$tr('isite.cms.message.recordNoCreated')}` });
      });
    },
    deleteItem(item) {
      this.$crud.delete('apiRoutes.qinventory.items', item.id).then(response => {
        this.$alert.info({ message: `${this.$tr('isite.cms.message.recordDeleted')}` });
        this.getInventory();
      }).catch(error => {
        this.$alert.error({ message: `${this.$tr('isite.cms.message.recordNoDeleted')}` });
      });
    },
    setTotalToRow(row, rowIndex) {
      let total = this.sizeRange.reduce((sum, size) => {
        return sum + (Number(row.sizesModel[size]) || 0);
      }, 0);
      this.items[rowIndex].sizesModelQuantity = total;
    },
    moveInventory(row, operation) {
      const params = {
        mode: 'modal',
        message: `<div class="text-blue-grey">
        <div><b>Bota: </b> ${row.shoe.reference} - ${row.shoe.title.toLowerCase()}</div>
        <div><b>Cantidad: </b>${row.sizesModelQuantity}</div>
        <div><b>Movimiento: </b> ${operation == 'add' ? 'ENTRADA' : 'SALIDA'}</div>
        </div>`,
        actions: [
          { label: 'Cancelar', color: 'grey' },
          {
            label: 'Guardar',
            color: 'blue',
            handler: () => {
              this.$crud.update(
                'apiRoutes.qinventory.items',
                row.id, {
                  operation,
                  sizes: this.sizeRange.map(size => ({
                    size,
                    quantity: row.sizesModel[size] || 0
                  }))
                }
              ).then(response => {
                this.$alert.info({ message: `${this.$tr('isite.cms.message.recordUpdated')}` });
                this.movingItemId = row.id;
                this.getInventory();
              }).catch(error => {
                this.$alert.error({ message: `${this.$tr('isite.cms.message.recordNoUpdated')}` });
              });
            }
          }
        ]
      };

      if (operation == 'add') this.$alert.info({ ...params, title: 'Entrada a Inventario' });
      else this.$alert.warning({ ...params, title: 'Salida de Inventario' });
    }
  }
};
</script>
<style lang="stylus">
</style>
