const { getProduct } = require('../../utils/products')
const storage = require('../../utils/storage')

Page({
  data: { product: getProduct(101), saving: 110, isVerified: false, showPoster: false, posterPath: '' },

  onLoad(options) {
    const product = getProduct(options.id)
    const certification = storage.get('certification', {})
    this.setData({ product, saving: product.originPrice - product.nursePrice, isVerified: certification.status === 'verified' })
  },

  addToCart() {
    if (this.addingCart) return
    this.addingCart = true
    const cart = storage.get('cart', [])
    cart.push({ productId: this.data.product.id, quantity: 1, addedAt: Date.now() })
    storage.set('cart', cart)
    wx.showToast({ title: '已加入购物车', icon: 'success' })
    setTimeout(() => { this.addingCart = false }, 500)
  },

  backHome() { wx.reLaunch({ url: '/pages/home/home' }) },
  onShareAppMessage() { return { title: `护士优选｜${this.data.product.name}`, path: `/pages/product-detail/product-detail?id=${this.data.product.id}` } },

  generatePoster() {
    if (this.generatingPoster) return
    this.generatingPoster = true
    this.setData({ showPoster: true, posterPath: '' }, () => {
      wx.getImageInfo({
        src: '/assets/images/poster-template.jpg',
        success: template => {
          this.posterTemplatePath = template.path
          wx.getImageInfo({
            src: this.data.product.image,
            success: product => { this.posterProductPath = product.path; this.drawPoster() },
            fail: () => this.drawPoster()
          })
        },
        fail: () => this.drawPoster()
      })
    })
  },

  drawPoster() {
    const product = this.data.product
    const context = wx.createCanvasContext('promotionPoster', this)
    const windowWidth = wx.getWindowInfo().windowWidth
    const width = windowWidth * 0.6
    const height = width * 1.6
    context.scale(width / 300, width / 300)
    context.setFillStyle('#e8f7fd'); context.fillRect(0, 0, 300, 480)
    if (this.posterTemplatePath) context.drawImage(this.posterTemplatePath, 0, 0, 300, 480)
    context.setFillStyle('#257fa9'); context.setFontSize(18); context.fillText('护士优选 · 健康严选', 18, 34)
    context.setFillStyle('#ffffff'); context.fillRect(89, 72, 122, 122)
    if (this.posterProductPath) context.drawImage(this.posterProductPath, 91, 74, 118, 118)
    context.setFillStyle('#294554'); context.setFontSize(18)
    this.drawWrappedText(context, product.name, 20, 242, 260, 26, 2)
    context.setFillStyle('#6f8792'); context.setFontSize(12); context.fillText(product.feature, 20, 301)
    context.setFillStyle('#278fbf'); context.setFontSize(12); context.fillText('护士合伙人专享价', 20, 336)
    context.setFillStyle('#ec5e61'); context.setFontSize(13); context.fillText('¥', 20, 374); context.setFontSize(31); context.fillText(String(product.nursePrice), 35, 375)
    context.setFillStyle('#9dadb5'); context.setFontSize(11); context.fillText(`普通价 ¥${product.originPrice}`, 105, 373)
    context.setFillStyle('#355565')
    ;[[220,402,17,17],[253,402,18,18],[220,435,18,18],[246,430,8,8],[259,443,11,11],[244,449,7,7]].forEach(block => context.fillRect.apply(context, block))
    context.setFillStyle('#647e8b'); context.setFontSize(11); context.fillText('长按识别 · 专属推荐', 20, 423)
    context.setFillStyle('#95a7af'); context.setFontSize(9); context.fillText('Demo 推广码，仅供原型展示', 20, 446)
    context.draw(false, () => setTimeout(() => wx.canvasToTempFilePath({
      canvasId: 'promotionPoster', width, height, destWidth: 600, destHeight: 960,
      success: result => { this.generatingPoster = false; this.setData({ posterPath: result.tempFilePath }) },
      fail: () => { this.generatingPoster = false; wx.showToast({ title: '海报生成失败，请重试', icon: 'none' }) }
    }, this), 100))
  },

  drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines) {
    let line = ''; let lineIndex = 0
    for (let index = 0; index < text.length; index += 1) {
      const testLine = line + text[index]
      if (context.measureText(testLine).width > maxWidth && line) {
        context.fillText(line, x, y + lineIndex * lineHeight); line = text[index]; lineIndex += 1
        if (lineIndex >= maxLines - 1) break
      } else line = testLine
    }
    if (lineIndex < maxLines) context.fillText(line, x, y + lineIndex * lineHeight)
  },

  savePoster() {
    if (!this.data.posterPath) { wx.showToast({ title: '海报生成中，请稍候', icon: 'none' }); return }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterPath,
      success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: error => {
        if ((error.errMsg || '').includes('auth deny')) wx.showModal({ title: '需要相册权限', content: '请在设置中允许保存图片到相册。', confirmText: '去设置', success: result => { if (result.confirm) wx.openSetting() } })
        else wx.showToast({ title: '保存失败，请重试', icon: 'none' })
      }
    })
  },

  closePoster() { this.generatingPoster = false; this.setData({ showPoster: false }) },
  stopPropagation() {}
})
