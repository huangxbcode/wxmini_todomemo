// miniprogram/pages/main/cloud/cloud.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    doneNumber: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      hideDone: wx.getStorageSync('hideDone')
    })
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
    this.refreshItems()
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
  refreshItems: function() {
    app.cloudQuery().then(items => {
      items.reverse()
      let todoItems = []
      let doneItems = []
      items.forEach(v => {
        v.content = app.formatContentLocked(app.formatContent(v.content), v.locked)
        if (v.done) {
          doneItems.push(v)
        } else {
          todoItems.push(v)
        }
      })
      this.setData({
        todoItems: todoItems,
        todoNumber: todoItems.length,
        doneItems: doneItems,
        doneNumber: doneItems.length
      })
      wx.setNavigationBarTitle({
        title: '云上待办(' + this.data.todoNumber.toString() + ')',
      })
    })
  },
  done: function(e) {
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    app.cacheUpdateDone(index)
    app.cloudUpdateDone(id).then(res => {
      wx.vibrateShort()
      this.refreshItems()
    })
  },
  showPreview: function(e) {
    let id = e.currentTarget.dataset.id
    let locked = e.currentTarget.dataset.locked
    if (locked) {
      app.fingerPrint().then(res => {
        wx.navigateTo({
          url: '../preview/preview?type=cloud&id=' + id
        })
      }).catch(err => {
        if (err.errCode == 90009) {
          wx.showToast({
            title: '指纹不匹配',
            image: '/images/fail.png'
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '../preview/preview?type=cloud&id=' + id
      })
    }
  },
  moreOption: function(e) {
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    let locked = e.currentTarget.dataset.locked
    wx.showActionSheet({
      itemList: [locked ? '解锁' : '锁定', '从云上删除'],
      success: res => {
        let tapIndex = res.tapIndex
        switch (tapIndex) {
          case 0:
            if (locked) {
              app.fingerPrint().then(res => {
                app.cacheUpdateLocked(index, false)
                app.cloudUpdateLocked(id, false).then(res => {
                  this.refreshItems()
                })
              }).catch(err => {
                if (err.errCode == 90009) {
                  wx.showToast({
                    title: '指纹不匹配',
                    image: '/images/fail.png'
                  })
                }
              })
            } else {
              app.cacheUpdateLocked(index, true)
              app.cloudUpdateLocked(id, true).then(res => {
                this.refreshItems()
              })
            }
            break
          case 1:
            app.cloudRemove(id).then(res => {
              this.refreshItems()
            })
            break
        }
      }
    })
  },
  hideDone: function() {
    if (wx.getStorageSync('hideDone')) {
      this.setData({
        hideDone: !wx.getStorageSync('hideDone')
      })
      wx.setStorage({
        key: 'hideDone',
        data: !wx.getStorageSync('hideDone')
      })
    } else {
      this.setData({
        hideDone: true
      })
      wx.setStorage({
        key: 'hideDone',
        data: true
      })
    }
  },
})