// component/authorizephone/authorizephone.js
const util = require('../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showAuthorizephone: {
      type: Boolean,
      observer(newVal, oldVal) {
        this.setData({
          showAuthorizephone: newVal
        })
      }
    },
    code:{
      type: String,
      observer(newVal, oldVal) {
        this.setData({
          code: newVal
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    encryptedData: {},
    iv: '',
    code: '',
    showAuthorizephone: false,
    showxieyi: false,
    content: null,
    xieyitop: null,
    top: null,
  },
  lifetimes: {
    attached: function () {
      var device = wx.getSystemInfoSync();
      this.setData({
        top: (device.windowHeight - 340) / 2,
        xieyitop: (device.windowHeight - 460) / 2
      })
    }
  },
 
  /**
   * 组件的方法列表
   */
  methods: {
    closeshowAuthorizephone(){
      this.setData({
        showAuthorizephone: false
      })
      this.triggerEvent('phonevent', { showAuthorizephone: that.data.showAuthorizephone});
    },
    zhuce(){
      this.getXiyi('1')
    },
    yinsi(){
      this.getXiyi('2')
    },
    getXiyi(id){
      util.request('lanmao/protocol/'+id, 'GET', '', '', (loginres) => {
        wx.hideLoading()
        if (loginres.data.errorCode == 0) {
          this.setData({
            showxieyi: true,
            content: loginres.data.data.content
          })
        } else if (loginres.data.errorCode == 5001) {
          this.onLogin();
        }
      })
    },
    closeXieyi(){
      this.setData({
        showxieyi: false,
        content: null
      })
    },
    // getPhone(){
    //   var that = this;
    //   wx.login({
    //     success(res) {
    //         var data = {
    //           code: res.code,
    //           encryptedData: that.data.phoneencryptedData,
    //           iv: that.data.phoneiv
    //         }
    //         util.request('lanmao/mp/user/phone/bind', 'POST', data, '', (loginres) => {
    //           wx.hideLoading()
    //           if (loginres.data.errorCode == 0) {
    //             that.setData({
    //               showAuthorizephone: false
    //             })
    //             that.triggerEvent('myevent', { source: that.data.source});
    //             // that.triggerEvent('phonevent', { showAuthorizephone: that.data.showAuthorizephone});
    //           } else if (loginres.data.errorCode == 5001) {
    //             that.onLogin('getPhone');
    //           }
    //         })
    //     },
    //     fail: function (res) {
    //     }
    //   })
    // },
    getPhone(){
      var that = this;
      wx.login({
        success(res) {
            var data = {
              code: res.code,
              encryptedData: that.data.encryptedData,
              iv: that.data.iv
            }
          util.request('lanmao/mp/user/phone/bind', 'POST', data, '', (loginres) => {
            wx.hideLoading()
            if (loginres.data.errorCode == 0) {
              that.setData({
                showAuthorizephone: false
              })
              that.triggerEvent('phonevent', { showAuthorizephone: that.data.showAuthorizephone});
            } else if (loginres.data.errorCode == 5001) {
              that.onLogin();
            }
          })
      },
      fail: function (res) {
      }
  })
    },
    getphonenumber(e) {
      //登录
      if (e.detail.encryptedData && e.detail.iv) {
          this.setData({
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv
          })
          wx.showToast({
            title: '授权成功',
            icon: 'success',
            duration: 1500
          })
        this.getPhone()
      } else {
        wx.showModal({
          title: '提示',
          content: '若不授权微信登录，则无法使用小程序。',
          showCancel: false,
          confirmText: '授权',
          success: (res => {
            wx.openSetting({
              success: (res) => {
              }
            })
          })
        })
      }
    },
  }
})
