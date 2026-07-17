// 商品主数据：图片与文案集中维护，替换同名 assets 图片无需修改页面布局。
const products = [
  { id: 101, category: 'device', name: '臂式电子血压计 家用款', feature: '智能加压 · 大屏显示', originPrice: 299, nursePrice: 189, sales: '1.2k', badge: '热销', image: '/assets/images/product-blood-pressure.jpg', qualification: { name: '第二类医疗器械', number: '粤械注准2026XXXXXX', category: '电子血压计', manufacturer: '示例健康科技有限公司', usage: '用于家庭血压趋势监测' }, highlights: ['智能加压测量，读数清晰', '大字体屏幕，操作简单', '轻巧收纳，适合家庭日常监测'] },
  { id: 102, category: 'skincare', name: '医护舒缓修护护手霜', feature: '清爽保湿 · 日常护理', originPrice: 89, nursePrice: 49, sales: '856', badge: '值班好物', image: '/assets/images/product-hand-cream.jpg', qualification: { name: '化妆品备案信息', number: '粤G妆网备字2026XXXX', category: '普通化妆品', manufacturer: '示例生物科技有限公司', usage: '用于手部肌肤日常保湿护理' }, highlights: ['清爽质地，滋润不黏腻', '温和配方，适合日常护理', '便携包装，值班随身使用'] },
  { id: 103, category: 'device', name: '柔光护眼阅读台灯', feature: '均匀照明 · 多档调节', originPrice: 269, nursePrice: 169, sales: '634', badge: '严选', image: '/assets/images/product-eye-lamp.jpg', qualification: { name: '产品质量检验信息', number: 'DEMO-QC-2026-003', category: '照明电器', manufacturer: '示例智能照明有限公司', usage: '用于室内阅读辅助照明' }, highlights: ['宽幅柔光，桌面照明均匀', '多档亮度，按需调节', '简洁底座，适合居家使用'] },
  { id: 104, category: 'health', name: '一次性使用无菌医用敷料', feature: '独立包装 · 便携卫生', originPrice: 79, nursePrice: 45, sales: '429', badge: '资质可查', image: '/assets/images/product-dressing.jpg', qualification: { name: '第二类医疗器械', number: '粤械注准2026YYYYYY', category: '医用敷料', manufacturer: '示例医疗器械有限公司', usage: '供覆盖、护理非慢性创面使用' }, highlights: ['独立密封包装，方便取用', '材质柔软，按说明书使用', '家庭护理便携收纳'] }
]

function getProduct(id) { return products.find(item => item.id === Number(id)) || products[0] }

module.exports = { products, getProduct }
