const storage = require('../../utils/storage')

const DEFAULT_COUPONS = [
  { id: 1, amount: 30, threshold: 199, title: '护士认证专享券', scope: '全场健康商品可用', expiry: '2026.08.31', status: 'available', tag: '即将到期' },
  { id: 2, amount: 15, threshold: 99, title: '医疗器械品类券', scope: '限医疗器械分类使用', expiry: '2026.09.15', status: 'available', tag: '' },
  { id: 3, amount: 10, threshold: 69, title: '医护护肤优惠券', scope: '限医护护肤分类使用', expiry: '2026.09.30', status: 'available', tag: '' },
  { id: 4, amount: 20, threshold: 159, title: '健康严选满减券', scope: '指定健康商品可用', expiry: '2026.07.10', status: 'used', tag: '已使用' },
  { id: 5, amount: 8, threshold: 49, title: '新人专享券', scope: '指定商品可用', expiry: '2026.06.30', status: 'expired', tag: '已过期' }
]

Page({
  data: { tabs: [{ id: 'available', name: '可使用' }, { id: 'used', name: '已使用' }, { id: 'expired', name: '已过期' }], activeTab: 'available', coupons: DEFAULT_COUPONS, filteredCoupons: [] },
  onLoad(options) {
    this.fromPayment = options.from === 'payment'
    const coupons = storage.get('coupons', DEFAULT_COUPONS)
    this.setData({ coupons }, this.filterCoupons)
  },
  selectTab(event) { this.setData({ activeTab: event.currentTarget.dataset.id }, this.filterCoupons) },
  filterCoupons() { this.setData({ filteredCoupons: this.data.coupons.filter(item => item.status === this.data.activeTab) }) },
  useCoupon(event) {
    const coupon = this.data.coupons.find(item => item.id === Number(event.currentTarget.dataset.id))
    storage.set('selectedCoupon', coupon)
    wx.showToast({ title: '已选中，去首页使用', icon: 'none' })
    setTimeout(() => {
      if (this.fromPayment) wx.navigateBack()
      else wx.reLaunch({ url: '/pages/home/home' })
    }, 500)
  }
})
