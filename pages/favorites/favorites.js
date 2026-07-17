const { products } = require('../../utils/products')
const storage = require('../../utils/storage')

Page({
  data: { favorites: [], isVerified: false },
  onShow() {
    const savedIds = storage.get('favoriteIds', products.map(item => item.id))
    const certification = storage.get('certification', {})
    this.setData({ favorites: products.filter(item => savedIds.indexOf(item.id) > -1), isVerified: certification.status === 'verified' })
  },
  openProduct(event) { wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${event.detail.id}` }) },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) },
  addToCart(event) {
    const cart = storage.get('cart', [])
    cart.push({ productId: event.detail.id, quantity: 1, addedAt: Date.now() })
    storage.set('cart', cart)
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },
  clearFavorites() {
    wx.showModal({ title: '清空收藏', content: '确认清空全部模拟收藏吗？', success: result => { if (result.confirm) { storage.set('favoriteIds', []); this.setData({ favorites: [] }) } } })
  }
})
