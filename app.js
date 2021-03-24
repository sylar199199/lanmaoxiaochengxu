//app.js
App({
  onShow() {
    let menuButtonObject;
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight;
        try{
          menuButtonObject = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null; 
          if (!menuButtonObject) {//报错
            if(res.model.indexOf('iPhone XR') >= 0 || res.model.indexOf('iPhone X')>= 0 ||  res.model.indexOf('iPhone XS Max')>=0||res.model.indexOf('iPhone XS')>=0){
              var navTop = '50',navHeight = '88';
              wx.setStorageSync('navHeight', navHeight);
              wx.setStorageSync('navTop', navTop);
            }else if(res.model.indexOf('iPhone 5')>=0 || res.model.indexOf('iPhone 6')>=0 ||  res.model.indexOf('iPhone 7')||  res.model.indexOf('iPhone 8')>=0 || res.model.indexOf('iPhone 6 Plus')>=0|| res.model.indexOf('iPhone 7 Plus')>=0 ||res.model.indexOf('iPhone 7 Plus')>=0||res.model.indexOf('iPad')>=0){
              var navTop = '26',navHeight = '64';
              wx.setStorageSync('navHeight', navHeight);
              wx.setStorageSync('navTop', navTop);
            }else if(res.model.indexOf('vivo')>=0){
              var navTop = '31',navHeight = '66';
              wx.setStorageSync('navHeight', navHeight);
              wx.setStorageSync('navTop', navTop);
            }
          }else{
            var navTop = menuButtonObject.top,//胶囊按钮与顶部的距离
            navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2;//导航高度
            wx.setStorageSync('navHeight', navHeight);
            wx.setStorageSync('navTop', navTop);
            console.log(navTop,navHeight)
            this.globalData.navHeight = navHeight;
            this.globalData.navTop = navTop;
            this.globalData.windowHeight = res.windowHeight;
          }
        } catch(err) {
          if(res.model.indexOf('iPhone XR') >= 0 || res.model.indexOf('iPhone X')>= 0 ||  res.model.indexOf('iPhone XS Max')>=0 ||  res.model.indexOf('iPhone XS')>=0){
            var navTop = '50',navHeight = '88';
            wx.setStorageSync('navHeight', navHeight);
            wx.setStorageSync('navTop', navTop);
          }else if(res.model.indexOf('iPhone 5')>=0 || res.model.indexOf('iPhone 6')>=0 ||  res.model.indexOf('iPhone 7')||  res.model.indexOf('iPhone 8')>=0 || res.model.indexOf('iPhone 6 Plus')>=0|| res.model.indexOf('iPhone 7 Plus')>=0 ||res.model.indexOf('iPhone 7 Plus')>=0||res.model.indexOf('iPad')>=0){
            var navTop = '26',navHeight = '64';
            wx.setStorageSync('navHeight', navHeight);
            wx.setStorageSync('navTop', navTop);
          }else if(res.model.indexOf('vivo')>=0){
            var navTop = '31',navHeight = '66';
            wx.setStorageSync('navHeight', navHeight);
            wx.setStorageSync('navTop', navTop);
          }
        }
      },
      fail(err) {
        console.log(err);
      }
    })
    
  },
  onLoad: function (options) {
    console.log(options)
  },
  onLaunch: function (options) {
    // wx.showLoading({
    //   title: '加载中..',
    //   mask: true
    // })
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate)
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  
  globalData: {
    userInfo: null
  }
})