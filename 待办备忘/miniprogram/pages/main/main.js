// miniprogram/pages/main/main.js
const app = getApp()
const db = app.globalData.db
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
    let items = app.cacheQuery()
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
      doneNumber: doneItems.length,
      hideDone: wx.getStorageSync('hideDone')
    })
  },
  scroll: function(e) {
    let scrollTop = e.detail.scrollTop
    if (scrollTop > 36) {
      wx.setNavigationBarTitle({
        title: '待办(' + this.data.todoNumber.toString() + ')',
      })
    } else if (scrollTop < 36) {
      wx.setNavigationBarTitle({
        title: '',
      })
    }
  },
  newTodo: function() {
    if (!wx.getStorageSync('indexs')) {
      wx.setStorage({
        key: 'indexs',
        data: [0],
        success() {
          wx.navigateTo({
            url: 'edit/edit?newtodo=true&index=0'
          })
        }
      })
    } else {
      let indexs = wx.getStorageSync('indexs')
      indexs.push(indexs[indexs.length - 1] + 1)
      wx.setStorageSync('indexs', indexs)
      wx.navigateTo({
        url: 'edit/edit?newtodo=true&index=' + indexs[indexs.length - 1]
      })
    }
  },
  done: function(e) {
    let index = e.currentTarget.dataset.index
    app.cacheUpdateDone(index)
    wx.vibrateShort()
    this.refreshItems()
    db.collection('items').where({
      index: index
    }).get({
      success: res => {
        let id = res.data[0]._id
        app.cloudUpdateDone(id)
      }
    })
  },
  showDetail: function(e) {
    let index = e.currentTarget.dataset.index
    let locked = e.currentTarget.dataset.locked
    if (locked) {
      app.fingerPrint().then(res => {
        wx.navigateTo({
          url: 'edit/edit?newtodo=false&index=' + index
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
        url: 'edit/edit?newtodo=false&index=' + index
      })
    }
  },
  showPreview: function(e) {
    let index = e.currentTarget.dataset.index
    let locked = e.currentTarget.dataset.locked
    if (locked) {
      app.fingerPrint().then(res => {
        wx.navigateTo({
          url: 'preview/preview?type=cache&index=' + index
        })
      }).catch(err => {
        console.log(err)
        if (err.errCode == 90009) {
          wx.showToast({
            title: '指纹不匹配',
            image: '/images/fail.png'
          })
        }
      })
    } else {
      wx.navigateTo({
        url: 'preview/preview?type=cache&index=' + index
      })
    }
  },
  moreOption: function(e) {
    let index = e.currentTarget.dataset.index
    let locked = e.currentTarget.dataset.locked
    wx.showActionSheet({
      itemList: [locked ? '解锁' : '锁定', '上传云', '删除'],
      success: res => {
        let tapIndex = res.tapIndex
        switch (tapIndex) {
          case 0:
            if (locked) {
              app.fingerPrint().then(res => {
                app.cacheUpdateLocked(index, false)
                this.refreshItems()
                db.collection('items').where({
                  index: index
                }).get({
                  success: res => {
                    let id = res.data[0]._id
                    app.cloudUpdateLocked(id, false)
                  }
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
              this.refreshItems()
              db.collection('items').where({
                index: index
              }).get({
                success: res => {
                  let id = res.data[0]._id
                  app.cloudUpdateLocked(id, true)
                }
              })
            }
            break
          case 1:
            app.cloudAdd(wx.getStorageSync(index))
            break
          case 2:
            app.cacheRemove(index)
            this.refreshItems()
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
  cloud: function() {
    wx.navigateTo({
      url: 'cloud/cloud'
    })
  }
})