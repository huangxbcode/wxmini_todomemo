//app.js
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'test-44b39f',
        traceUser: true
      })
    }

    const db = wx.cloud.database({
      env: 'test-44b39f'
    })

    this.globalData = {
      db: db
    }
  },
  sync: function() {
    //同步云上事项到本地缓存
  },
  cacheAdd: function(index, content) {
    let data = {
      index: index,
      content: content,
      time: this.formatTime(new Date()),
      done: false,
      locked: wx.getStorageSync(index).locked ? wx.getStorageSync(index).locked : false
    }
    wx.setStorage({
      key: index,
      data: data,
    })
  },
  cacheRemove: function(index) {
    wx.removeStorageSync(index)
    let indexs = wx.getStorageSync('indexs')
    indexs.splice(indexs.indexOf(parseInt(index)), 1)
    if (indexs.length != 0) {
      wx.setStorageSync('indexs', indexs)
    } else {
      wx.removeStorageSync('indexs')
    }
  },
  cacheQuery: function() {
    let items = []
    let indexs = wx.getStorageSync('indexs')
    if (indexs) {
      indexs.forEach((v, i) => {
        items.push(wx.getStorageSync(v.toString()))
      })
    }
    return items
  },
  cacheUpdateDone: function(index) {
    let data = wx.getStorageSync(index)
    data = {
      index: data.index,
      content: data.content,
      time: data.time,
      done: true,
      locked: data.locked
    }
    wx.setStorageSync(index, data)
  },
  cacheUpdateLocked: function(index, locked) {
    let data = wx.getStorageSync(index)
    data = {
      index: data.index,
      content: data.content,
      time: data.time,
      done: data.done,
      locked: locked
    }
    wx.setStorageSync(index, data)
  },
  formatTime: function(prototypeTime) {
    let time = new Date()
    time.setTime(prototypeTime)
    let y = time.getFullYear()
    let m = time.getMonth() + 1
    let d = time.getDate()
    let hh = time.getHours() > 9 ? time.getHours() : '0' + time.getHours()
    let mm = time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes()
    let ss = time.getSeconds() > 9 ? time.getSeconds() : '0' + time.getSeconds()
    return y + '年' + m + '月' + d + '日 ' + hh + ':' + mm + ':' + ss
  },
  formatContent: function(prototypeContent) {
    prototypeContent = prototypeContent.slice(0, 32)
    if (prototypeContent.length == 32) {
      prototypeContent += '......'
    }
    return prototypeContent
  },
  formatContentLocked: function(prototypeContent, locked) {
    if (locked) {
      prototypeContent = prototypeContent.slice(0, 3)
    }
    return prototypeContent
  },
  cloudAdd: function(data) {
    this.globalData.db.collection('items').add({
      data: data,
      success: () => {
        wx.navigateTo({
          url: '/pages/main/cloud/cloud'
        })
      }
    })
  },
  cloudRemove: function(id) {
    return new Promise(resolve => {
      this.globalData.db.collection('items').doc(id).remove({
        success: res => {
          resolve(res)
        }
      })
    })
  },
  cloudQuery: function(id) {
    return new Promise(resolve => {
      this.globalData.db.collection('items').where({
        _id: id
      }).get({
        success: res => {
          let items = res.data
          resolve(items)
        }
      })
    })
  },
  cloudUpdateDone: function(id) {
    return new Promise(resolve => {
      this.globalData.db.collection('items').doc(id).update({
        data: {
          done: true
        },
        success: res => {
          resolve(res)
        }
      })
    })
  },
  cloudUpdate: function(id, data) {
    this.globalData.db.collection('items').doc(id).update({
      data: data
    })
  },
  cloudUpdateLocked: function(id, locked) {
    return new Promise(resolve => {
      this.globalData.db.collection('items').doc(id).update({
        data: {
          locked: locked
        },
        success: res => {
          resolve(res)
        }
      })
    })
  },
  fingerPrint: function () {
    return new Promise((resolve, reject) => {
      wx.startSoterAuthentication({
        requestAuthModes: ['fingerPrint'],
        challenge: 'zqy',
        authContent: '请用指纹解锁',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  }
})