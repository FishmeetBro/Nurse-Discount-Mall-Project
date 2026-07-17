Component({
  properties: { product: { type: Object, value: {} }, verified: { type: Boolean, value: false } },
  methods: {
    openDetail() { this.triggerEvent('open', { id: this.data.product.id }) },
    addCart() { this.triggerEvent('add', { id: this.data.product.id }) }
  }
})
