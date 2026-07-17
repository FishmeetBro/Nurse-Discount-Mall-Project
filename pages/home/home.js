const { products } = require('../../utils/products')
const storage = require('../../utils/storage')

// 首页分类数据：商品信息统一维护在 utils/products.js。
const HOME_DATA = {
  categories: [
    { id: 'all', name: '全部好物', note: '人气精选', icon: '✦', color: '#E7F6FF' },
    { id: 'device', name: '医疗器械', note: '家用监测', icon: '✚', color: '#E8F8F5' },
    { id: 'skincare', name: '医护护肤', note: '温和修护', icon: '❀', color: '#FFF1F4' },
    { id: 'health', name: '营养保健', note: '元气补给', icon: '♨', color: '#FFF6E5' }
  ]
}

Page({
  data: {
    categories: HOME_DATA.categories,
    products,
    filteredProducts: products,
    activeCategory: 'all',
    cartCount: 0,
    isVerified: false
  },

  onLoad() {
    // 所有演示状态保存在本地缓存，不依赖云开发。
    const cart = storage.get('cart', [])
    this.setData({ cartCount: cart.length })
  },

  onShow() {
    // 从认证页返回时即时刷新专属价解锁状态。
    const certification = storage.get('certification', {})
    this.setData({ isVerified: Boolean(certification && certification.status === 'verified') })
  },

  onPullDownRefresh() {
    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.showToast({ title: '已刷新', icon: 'success' })
    }, 500)
  },

  selectCategory(event) {
    const categoryId = event.currentTarget.dataset.id
    const filteredProducts = categoryId === 'all'
      ? this.data.products
      : this.data.products.filter(item => item.category === categoryId)

    this.setData({ activeCategory: categoryId, filteredProducts })
  },

  addToCart(event) {
    const productId = Number(event.detail.id)
    const product = this.data.products.find(item => item.id === productId)
    if (!product) return
    const cart = storage.get('cart', [])
    cart.push({ productId, quantity: 1, addedAt: Date.now() })
    storage.set('cart', cart)
    this.setData({ cartCount: cart.length })
    wx.showToast({ title: `已加入：${product.name}`, icon: 'none' })
  },

  openProduct(event) {
    const productId = event.detail.id
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${productId}` })
  },

  goCertification() {
    wx.navigateTo({ url: '/pages/certification/certification' })
  },

  handleBanner() {
    wx.showToast({ title: '活动专区为演示入口', icon: 'none' })
  },

  openCart() {
    wx.navigateTo({ url: '/pages/cart/cart' })
  },

  openPartner() {
    wx.navigateTo({ url: '/pages/partner/partner' })
  },

  openProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  showAllProducts() {
    this.setData({ activeCategory: 'all', filteredProducts: this.data.products })
  }
})
