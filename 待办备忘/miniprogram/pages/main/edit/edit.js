// miniprogram/pages/edit/edit.js
const app = getApp()
const db = app.globalData.db
let index
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    index = options.index
    if (options.newtodo == 'true') {
      this.setData({
        focus: true
      })
    } else {
      let data = wx.getStorageSync(index)
      wx.setNavigationBarTitle({
        title: data.time,
      })
      this.setData({
        content: data.content
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    //清除缓存失效无用索引
    let indexs = wx.getStorageSync('indexs')
    if (indexs) {
      indexs.forEach((v, i) => {
        if (wx.getStorageSync(v.toString()) == '') {
          indexs.splice(i, 1)
        }
      })
      if (indexs.length != 0) {
        wx.setStorageSync('indexs', indexs)
      } else {
        wx.removeStorageSync('indexs')
      }
    }
    //修改本地缓存待办，联动更新云上待办
    let data = wx.getStorageSync(index)
    db.collection('items').where({
      index: index
    }).get({
      success: res => {
        let id = res.data[0]._id
        app.cloudUpdate(id, data)
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  autoSave: function(e) {
    if (e.detail.value != '') {
      app.cacheAdd(index, e.detail.value)
    } else {
      app.cacheRemove(index)
    }
  }
})