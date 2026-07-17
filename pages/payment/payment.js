const { getProduct } = require('../../utils/products')
const storage = require('../../utils/storage')

Page({
  data: { items: [], coupon: null, goodsTotal: '0.00', discount: '0.00', payable: '0.00', paying: false },
  onLoad(options) {
    this.selectedIds = (options.ids || '').split(',').map(Number).filter(Boolean)
    this.loadOrder()
  },
  onShow() {
    if (this.selectedIds) this.loadOrder()
  },
  loadOrder() {
    const cart = storage.get('cart', [])
    const items = cart.filter(item => this.selectedIds.indexOf(Number(item.productId)) > -1).map(item => ({ id: Number(item.productId), product: getProduct(item.productId), quantity: Number(item.quantity) || 1 }))
    const coupon = storage.get('selectedCoupon', null)
    this.setData({ items, coupon }, this.calculate)
  },
  calculate() {
    const goodsTotal = this.data.items.reduce((sum, item) => sum + item.product.nursePrice * item.quantity, 0)
    const coupon = this.data.coupon
    const discount = coupon && goodsTotal >= coupon.threshold ? coupon.amount : 0
    this.setData({ goodsTotal: goodsTotal.toFixed(2), discount: discount.toFixed(2), payable: Math.max(0, goodsTotal - discount).toFixed(2) })
  },
  chooseCoupon() { wx.navigateTo({ url: '/pages/coupons/coupons?from=payment' }) },
  pay() {
    if (this.data.paying || !this.data.items.length) return
    this.setData({ paying: true })
    setTimeout(() => {
      const profile = storage.get('profile', {})
      const orders = Array.isArray(profile.orders) ? profile.orders.slice() : []
      const first = this.data.items[0]
      orders.unshift({ id: Date.now(), productId: first.product.id, orderNo: String(Date.now()), status: 'shipping', statusText: '待发货', name: this.data.items.length > 1 ? `${first.product.name} 等${this.data.items.length}件` : first.product.name, spec: `共 ${this.data.items.reduce((sum,item) => sum + item.quantity, 0)} 件`, price: this.data.payable, quantity: 1, total: this.data.payable, image: first.product.image })
      storage.set('profile', Object.assign({}, profile, { orders }))
      const paidIds = this.data.items.map(item => item.product.id)
      storage.set('cart', storage.get('cart', []).filter(item => paidIds.indexOf(Number(item.productId)) === -1))
      storage.remove('selectedCoupon')
      wx.showModal({ title: '支付成功（Demo）', content: '订单已生成，可在个人中心查看。', showCancel: false, success: () => wx.reLaunch({ url: '/pages/profile/profile' }) })
    }, 650)
  }
})
