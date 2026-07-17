// 合规提示公共组件：卡片常驻展示，完整规则以原生弹层展开。
Component({
  properties: { title: { type: String, value: '合规提示' }, compact: { type: Boolean, value: false } },
  data: { visible: false },
  methods: {
    openRules() { this.setData({ visible: true }) },
    closeRules() { this.setData({ visible: false }) },
    stopPropagation() {}
  }
})
