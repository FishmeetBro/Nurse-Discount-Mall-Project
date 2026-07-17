// 纯 Node 业务回归测试：在项目根目录通过 stdin 执行，模拟微信缓存和页面实例。
const assert = require('assert')

const memory = new Map()
global.wx = {
  getStorageSync(key) { return memory.has(key) ? memory.get(key) : '' },
  setStorageSync(key, value) { memory.set(key, value) },
  removeStorageSync(key) { memory.delete(key) },
  navigateTo() {},
  reLaunch() {},
  showToast() {},
  showModal(options) { if (options.success) options.success({ confirm: true }) },
  stopPullDownRefresh() {}
}

let capturedPage = null
global.Page = definition => { capturedPage = definition }

function loadPage(modulePath) {
  capturedPage = null
  delete require.cache[require.resolve(modulePath)]
  require(modulePath)
  assert(capturedPage, `页面未注册：${modulePath}`)
  const page = Object.assign({}, capturedPage)
  page.data = JSON.parse(JSON.stringify(capturedPage.data || {}))
  page.setData = function setData(patch, callback) {
    Object.assign(this.data, patch)
    if (callback) callback.call(this)
  }
  return page
}

async function run() {
  const storage = require('./utils/storage')
  storage.set('cart', [
    { productId: 101, quantity: 2, addedAt: 1 },
    { productId: 102, quantity: 1, addedAt: 2 }
  ])
  storage.set('selectedCoupon', { id: 1, threshold: 100, amount: 20 })

  const payment = loadPage('./pages/payment/payment.js')
  payment.onLoad({ ids: '101' })
  assert.strictEqual(payment.data.items.length, 1, '结算商品筛选失败')
  assert.strictEqual(payment.data.goodsTotal, '378.00', '商品总额计算错误')
  assert.strictEqual(payment.data.discount, '20.00', '优惠券抵扣错误')
  assert.strictEqual(payment.data.payable, '358.00', '应付金额计算错误')

  payment.pay()
  await new Promise(resolve => setTimeout(resolve, 750))

  const cartAfterPay = storage.get('cart', [])
  assert.deepStrictEqual(cartAfterPay.map(item => item.productId), [102], '已支付商品未从购物车移除')
  assert.strictEqual(storage.get('selectedCoupon', null), null, '支付后优惠券未清理')

  const profile = loadPage('./pages/profile/profile.js')
  profile.onLoad()
  assert.strictEqual(profile.data.orders[0].total, '358.00', '支付订单未写入个人中心')
  const shipping = profile.data.orderStatuses.find(item => item.id === 'shipping')
  const shippingOrderCount = profile.data.orders.filter(item => item.status === 'shipping').length
  assert.strictEqual(shipping.count, shippingOrderCount, '订单状态角标未根据本地订单重新汇总')

  console.log('BUSINESS FLOW TEST PASSED')
}

run().catch(error => {
  console.error(error)
  process.exitCode = 1
})
