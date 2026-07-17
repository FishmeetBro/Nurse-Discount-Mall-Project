// 本页只做本地模拟认证，不会向服务器发送身份证或证件图片。
const storage = require('../../utils/storage')
const STORAGE_KEY = 'certification'

Page({
  data: {
    status: 'unverified',
    idCard: '',
    idError: '',
    certificateImage: '',
    agreed: false,
    canSubmit: false
  },

  onLoad() {
    const saved = storage.get(STORAGE_KEY, {})
    if (saved && saved.status === 'verified') {
      this.setData({ status: 'verified' })
    }
  },

  onUnload() {
    if (this.reviewTimer) clearTimeout(this.reviewTimer)
  },

  onIdInput(event) {
    const idCard = event.detail.value.replace(/\s/g, '')
    this.setData({ idCard, idError: '' }, this.updateSubmitState)
  },

  clearIdCard() {
    this.setData({ idCard: '', idError: '' }, this.updateSubmitState)
  },

  validateIdCard() {
    const isValid = /^\d{17}[\dXx]$/.test(this.data.idCard)
    this.setData({ idError: this.data.idCard && !isValid ? '请输入正确的18位身份证号码' : '' }, this.updateSubmitState)
    return isValid
  },

  chooseCertificate() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (result) => {
        const file = result.tempFiles[0]
        if (file.size > 10 * 1024 * 1024) {
          wx.showToast({ title: '图片不能超过10MB', icon: 'none' })
          return
        }
        this.setData({ certificateImage: file.tempFilePath }, this.updateSubmitState)
      }
    })
  },

  previewCertificate() {
    wx.previewImage({ urls: [this.data.certificateImage] })
  },

  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed }, this.updateSubmitState)
  },

  updateSubmitState() {
    const idValid = /^\d{17}[\dXx]$/.test(this.data.idCard)
    this.setData({ canSubmit: Boolean(idValid && this.data.certificateImage && this.data.agreed) })
  },

  submitReview() {
    if (!this.validateIdCard() || !this.data.certificateImage || !this.data.agreed) return

    this.setData({ status: 'reviewing' })
    storage.set(STORAGE_KEY, { status: 'reviewing', submittedAt: Date.now() })

    // 模拟异步审核：2秒后自动通过。
    this.reviewTimer = setTimeout(() => {
      const verifiedData = {
        status: 'verified',
        verifiedAt: Date.now(),
        maskedIdCard: `${this.data.idCard.slice(0, 6)}********${this.data.idCard.slice(-4)}`
      }
      storage.set(STORAGE_KEY, verifiedData)
      this.setData({ status: 'verified' })
      wx.showToast({ title: '认证通过', icon: 'success' })
    }, 2000)
  },

  backHome() {
    wx.navigateBack({
      delta: 1,
      fail: () => wx.reLaunch({ url: '/pages/home/home' })
    })
  },

  resetCertification() {
    wx.showModal({
      title: '重置演示状态',
      content: '确认后可重新演示完整认证流程。',
      success: (result) => {
        if (!result.confirm) return
        storage.remove(STORAGE_KEY)
        this.setData({
          status: 'unverified',
          idCard: '',
          idError: '',
          certificateImage: '',
          agreed: false,
          canSubmit: false
        })
      }
    })
  }
})
