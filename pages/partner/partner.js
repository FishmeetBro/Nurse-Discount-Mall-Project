const storage = require('../../utils/storage')
// 二级佣金计算仅用于 Demo：一级 10%，二级 5%，不允许传入三级关系。
function calculateCommission(orderAmount, level) {
  const rates = { 1: 0.1, 2: 0.05 }
  const rate = rates[level] || 0
  return (Number(orderAmount) * rate).toFixed(2)
}
// 合伙人页面全部为本地模拟数据，可直接修改数字与朋友圈文案。
const PARTNER_DATA = {
  partner: { name: '林护士', level: '认证合伙人', id: 'NURSE20260716', totalCommission: '3,286.50', settled: '2,460.00', todayEstimate: '68.20', monthEstimate: '826.50', pending: '826.50', promotionLink: 'nurse-demo.cn/p/NURSE20260716' },
  team: { total: 38, firstLevel: 12, secondLevel: 26, firstNew: 3, secondNew: 6 },
  commissions: [
    { id: 1, title: '臂式电子血压计', date: '07-16 14:32', level: '一级推广', amount: calculateCommission(189, 1), status: '待结算' },
    { id: 2, title: '医护舒缓修护护手霜', date: '07-15 20:18', level: '二级推广', amount: calculateCommission(98, 2), status: '待结算' },
    { id: 3, title: '柔光护眼阅读台灯', date: '07-12 09:45', level: '一级推广', amount: calculateCommission(99, 1), status: '已结算' }
  ],
  materials: [
    { id: 1, tag: '值班好物', scene: '朋友圈', words: 70, copy: '最近值班随身带着这款护手霜，频繁清洁后及时做日常保湿护理，质地清爽。护士认证可查看专属优惠，按需选择，不作功效承诺。' },
    { id: 2, tag: '家庭健康', scene: '朋友圈', words: 76, copy: '给家里准备了一台操作简单的电子血压计，方便日常记录血压趋势。医疗器械请按说明书规范使用，监测数据异常时应及时咨询专业医务人员。' },
    { id: 3, tag: '健康严选', scene: '私聊推荐', words: 65, copy: '分享一个健康好物严选商城，护士完成身份认证后可以查看专属价格。商品资质信息可查，建议结合自身实际需求理性选购。' }
  ]
}

Page({
  data: { partner: PARTNER_DATA.partner, team: PARTNER_DATA.team, commissions: PARTNER_DATA.commissions, materials: PARTNER_DATA.materials, hideIncome: false },

  onLoad() {
    const saved = storage.get('partner', {})
    if (saved.partner && saved.team && Array.isArray(saved.commissions) && Array.isArray(saved.materials)) this.setData({ partner: saved.partner, team: saved.team, commissions: saved.commissions, materials: saved.materials })
    else storage.set('partner', PARTNER_DATA)
  },

  onPullDownRefresh() {
    setTimeout(() => { wx.stopPullDownRefresh(); wx.showToast({ title: '数据已更新', icon: 'success' }) }, 500)
  },

  toggleIncome() { this.setData({ hideIncome: !this.data.hideIncome }) },

  copyLink() { wx.setClipboardData({ data: `https://${this.data.partner.promotionLink}` }) },

  copyMaterial(event) {
    const material = this.data.materials[Number(event.currentTarget.dataset.index)]
    wx.setClipboardData({ data: material.copy, success: () => wx.showToast({ title: '文案已复制', icon: 'success' }) })
  },

  showRules() {
    wx.showModal({ title: '二级分佣规则', content: '仅计算本人直接推广（一级）及一级护士合规分享产生的（二级）订单佣金，不设置三级及以上关系。演示数据不代表实际收益。', showCancel: false })
  },

  showPosterTip() {
    wx.showModal({ title: '生成推广海报', content: '请从首页进入任一商品详情，点击“生成推广海报”即可生成对应商品海报。', confirmText: '去选商品', success: result => { if (result.confirm) wx.reLaunch({ url: '/pages/home/home' }) } })
  },

  showAllCommission() { wx.showToast({ title: '当前展示最近3条模拟明细', icon: 'none' }) },

  onShareAppMessage() { return { title: '护士优选｜专业健康好物严选', path: '/pages/home/home?ref=NURSE20260716' } }
})
