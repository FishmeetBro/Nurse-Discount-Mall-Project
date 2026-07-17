// 本地缓存统一入口：提供版本键、默认值与类型保护，避免脏数据导致页面白屏。
const PREFIX = 'nurseMall:v2:'

function get(key, fallback) {
  try {
    const value = wx.getStorageSync(PREFIX + key)
    if (value === '' || value === null || typeof value === 'undefined') return fallback
    if (Array.isArray(fallback) && !Array.isArray(value)) return fallback
    if (fallback && typeof fallback === 'object' && !Array.isArray(fallback) && (typeof value !== 'object' || Array.isArray(value))) return fallback
    return value
  } catch (error) {
    console.warn('[storage:get]', key, error)
    return fallback
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(PREFIX + key, value)
    return true
  } catch (error) {
    console.warn('[storage:set]', key, error)
    return false
  }
}

function remove(key) {
  try { wx.removeStorageSync(PREFIX + key) } catch (error) { console.warn('[storage:remove]', key, error) }
}

module.exports = { get, set, remove, PREFIX }
