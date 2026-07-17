const { products, getProduct } = require('../../utils/products')
const storage = require('../../utils/storage')

Page({
  data: { items: [], allSelected: true, selectedCount: 0, totalPrice: '0.00', editing: false },

  onShow() { this.loadCart() },

  loadCart() {
    const rawCart = storage.get('cart', [])
    const quantityMap = {}
    rawCart.forEach(item => {
      const id = Number(item.productId)
      if (products.some(product => product.id === id)) quantityMap[id] = (quantityMap[id] || 0) + Math.max(1, Number(item.quantity) || 1)
    })
    const items = Object.keys(quantityMap).map(id => ({ id: Number(id), product: getProduct(id), quantity: quantityMap[id], selected: true }))
    this.setData({ items }, this.recalculate)
    this.persistCart(items)
  },

  toggleEdit() { this.setData({ editing: !this.data.editing }) },

  toggleItem(event) {
    const id = Number(event.currentTarget.dataset.id)
    const items = this.data.items.map(item => item.product.id === id ? Object.assign({}, item, { selected: !item.selected }) : item)
    this.setData({ items }, this.recalculate)
  },

  toggleAll() {
    const selected = !this.data.allSelected
    this.setData({ items: this.data.items.map(item => Object.assign({}, item, { selected })) }, this.recalculate)
  },

  changeQuantity(event) {
    const id = Number(event.currentTarget.dataset.id)
    const delta = Number(event.currentTarget.dataset.delta)
    const items = this.data.items.map(item => item.product.id === id ? Object.assign({}, item, { quantity: Math.max(1, Math.min(99, item.quantity + delta)) }) : item)
    this.setData({ items }, () => { this.persistCart(items); this.recalculate() })
  },

  deleteItem(event) {
    const id = Number(event.currentTarget.dataset.id)
    const items = this.data.items.filter(item => item.product.id !== id)
    this.setData({ items }, () => { this.persistCart(items); this.recalculate(); wx.showToast({ title: '已删除', icon: 'none' }) })
  },

  deleteSelected() {
    const items = this.data.items.filter(item => !item.selected)
    if (items.length === this.data.items.length) { wx.showToast({ title: '请先选择商品', icon: 'none' }); return }
    this.setData({ items }, () => { this.persistCart(items); this.recalculate() })
  },

  recalculate() {
    const selected = this.data.items.filter(item => item.selected)
    const total = selected.reduce((sum, item) => sum + item.product.nursePrice * item.quantity, 0)
    this.setData({ selectedCount: selected.reduce((sum, item) => sum + item.quantity, 0), totalPrice: total.toFixed(2), allSelected: this.data.items.length > 0 && selected.length === this.data.items.length })
  },

  persistCart(items) {
    storage.set('cart', items.map(item => ({ productId: item.product.id, quantity: item.quantity, addedAt: Date.now() })))
  },

  checkout() {
    const selectedIds = this.data.items.filter(item => item.selected).map(item => item.product.id)
    if (!selectedIds.length) { wx.showToast({ title: '请选择结算商品', icon: 'none' }); return }
    wx.navigateTo({ url: `/pages/payment/payment?ids=${selectedIds.join(',')}` })
  },

  goShopping() { wx.reLaunch({ url: '/pages/home/home' }) }
})
