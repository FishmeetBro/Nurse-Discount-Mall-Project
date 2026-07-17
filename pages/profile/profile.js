const storage = require('../../utils/storage')
// 个人中心数据全部为本地 Demo 数据，不会调用支付或物流接口。
const PROFILE_DATA = {
  assets: { coupons: 5, points: 1280, pointsValue: '12.80', favorites: 4 },
  orderStatuses: [
    { id: 'unpaid', name: '待付款', icon: '¥', count: 1 }, { id: 'shipping', name: '待收货', icon: '▣', count: 1 },
    { id: 'finished', name: '已完成', icon: '✓', count: 0 }, { id: 'refund', name: '退款/售后', icon: '↺', count: 0 }
  ],
  orders: [
    { id: 1, productId: 101, orderNo: '202607160001', status: 'unpaid', statusText: '等待付款', name: '臂式电子血压计 家用款', spec: '标准款 · 1台', price: '189.00', quantity: 1, total: '189.00', image: '/assets/images/product-blood-pressure.jpg' },
    { id: 2, productId: 102, orderNo: '202607120018', status: 'shipping', statusText: '运输中', name: '医护舒缓修护护手霜', spec: '清润型 · 2支', price: '49.00', quantity: 2, total: '98.00', image: '/assets/images/product-hand-cream.jpg' },
    { id: 3, productId: 103, orderNo: '202606280026', status: 'finished', statusText: '已完成', name: '柔光护眼阅读台灯', spec: '标准款 · 1台', price: '169.00', quantity: 1, total: '169.00', image: '/assets/images/product-eye-lamp.jpg' }
  ],
  performance: { orders: 46, orderGrowth: 18.5, commission: '826.50', pending: '826.50', team: 38, newTeam: 9, trend: [
    { month: '2月', value: 18, height: 38 }, { month: '3月', value: 25, height: 52 }, { month: '4月', value: 31, height: 65 },
    { month: '5月', value: 29, height: 60 }, { month: '6月', value: 38, height: 79 }, { month: '7月', value: 46, height: 96 }
  ] },
  services: [
    { id: 'address', name: '收货地址', icon: '⌖', color: '#e5f5fc' }, { id: 'coupon', name: '领券中心', icon: '券', color: '#fff1e8' },
    { id: 'support', name: '客服帮助', icon: '?', color: '#e8f7f1' }, { id: 'about', name: '关于平台', icon: 'i', color: '#f1edfc' }
  ]
}

Page({
  data: { isVerified: false, assets: PROFILE_DATA.assets, orderStatuses: PROFILE_DATA.orderStatuses, orders: PROFILE_DATA.orders, filteredOrders: PROFILE_DATA.orders, activeOrderStatus: 'all', performance: PROFILE_DATA.performance, services: PROFILE_DATA.services },
  onLoad() {
    const saved = storage.get('profile', {}) || {}
    const profile = {
      assets: saved.assets || PROFILE_DATA.assets,
      orderStatuses: Array.isArray(saved.orderStatuses) ? saved.orderStatuses : PROFILE_DATA.orderStatuses,
      orders: Array.isArray(saved.orders) ? saved.orders : PROFILE_DATA.orders,
      performance: saved.performance || PROFILE_DATA.performance,
      services: Array.isArray(saved.services) ? saved.services : PROFILE_DATA.services
    }
    // 每次进入页面都根据真实本地订单重新汇总角标，避免模拟支付后仍显示旧数量。
    profile.orderStatuses = profile.orderStatuses.map(item => Object.assign({}, item, {
      count: profile.orders.filter(order => order.status === item.id).length
    }))
    this.setData({
      assets: profile.assets,
      orderStatuses: profile.orderStatuses,
      orders: profile.orders,
      filteredOrders: profile.orders,
      performance: profile.performance,
      services: profile.services
    })
    storage.set('profile', profile)
  },
  onShow() {
    const certification = storage.get('certification', {})
    this.setData({ isVerified: Boolean(certification && certification.status === 'verified') })
  },
  onPullDownRefresh() { setTimeout(() => { wx.stopPullDownRefresh(); wx.showToast({ title: '数据已刷新', icon: 'success' }) }, 500) },
  openCertification() { wx.navigateTo({ url: '/pages/certification/certification' }) },
  openPartner() { wx.navigateTo({ url: '/pages/partner/partner' }) },
  selectOrderStatus(event) {
    const status = event.currentTarget.dataset.status
    this.setData({ activeOrderStatus: status, filteredOrders: status === 'all' ? this.data.orders : this.data.orders.filter(item => item.status === status) })
  },
  handleOrder(event) {
    const action = event.detail.action
    const messages = { detail: '订单详情为本地模拟数据', pay: '支付成功（Demo）', logistics: '模拟物流：配送途中', buyAgain: '已将商品重新加入购物车' }
    if (action === 'pay') {
      const orders = this.data.orders.map(item => item.id === Number(event.detail.id) ? Object.assign({}, item, { status: 'shipping', statusText: '待发货' }) : item)
      const orderStatuses = this.data.orderStatuses.map(item => Object.assign({}, item, { count: orders.filter(order => order.status === item.id).length }))
      const filteredOrders = this.data.activeOrderStatus === 'all' ? orders : orders.filter(item => item.status === this.data.activeOrderStatus)
      this.setData({ orders, orderStatuses, filteredOrders })
      storage.set('profile', Object.assign({}, PROFILE_DATA, { orders, orderStatuses }))
    }
    if (action === 'buyAgain') {
      const order = this.data.orders.find(item => item.id === Number(event.detail.id))
      const cart = storage.get('cart', [])
      cart.push({ productId: order.productId, quantity: order.quantity, addedAt: Date.now() })
      storage.set('cart', cart)
    }
    wx.showToast({ title: messages[action], icon: 'none' })
  },
  showAsset(event) {
    const type = event.currentTarget.dataset.type
    if (type === 'coupon') { wx.navigateTo({ url: '/pages/coupons/coupons' }); return }
    if (type === 'favorite') { wx.navigateTo({ url: '/pages/favorites/favorites' }); return }
    wx.showToast({ title: '积分页面暂未开放', icon: 'none' })
  },
  openService(event) {
    const names = { address: '收货地址', coupon: '领券中心', support: '客服帮助', about: '关于平台' }
    wx.showToast({ title: `${names[event.currentTarget.dataset.id]}为演示入口`, icon: 'none' })
  },
  showSetting() { wx.showToast({ title: '设置功能为演示入口', icon: 'none' }) }
})
