// component/authorize/authorize.js
const util = require('../../utils/util.js');
const App = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showAuthorize: {
      type: Boolean,
      observer(newVal, oldVal) {
        this.setData({
          showAuthorize: newVal
        })
        this.getguidimg()
      }
    },
    source:{
      type: String,
      observer(newVal, oldVal) {
        this.setData({
          source: newVal
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    bacImg: '',
    isDisabled: false,
    showAuthorize: false,
    infotop: null,
    regInfo: {},
    inviteUserId: '',
    inviteType: '',
    infobutton:'https://oss.ifxj.com/lanmao/health/getinfobutton.png?'+Date.parse(new Date()),
    posterid: '',
    phoneencryptedData: {},
    phoneiv: '',
    showAuthorizephone: false,
    showxieyi: false,
    content: null,
    xieyitop: null,
    phonetop: null,
    
  },
  lifetimes: {
    attached: function () {
     
      if(wx.getStorageSync('inviteUserId')){
        this.setData({
          inviteUserId: wx.getStorageSync('inviteUserId'),
          inviteType: wx.getStorageSync('inviteType')
        })
      }
      var device = wx.getSystemInfoSync();
      this.setData({
        phonetop: (device.windowHeight - 340) / 2,
        infotop: (device.windowHeight - 460) / 2,
        xieyitop: (device.windowHeight - 460) / 2
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 手机号注册start
    closeshowAuthorizephone(){
      this.setData({
        showAuthorizephone: false
      })
      that.triggerEvent('myevent', { source: that.data.source});
      // this.triggerEvent('phonevent', { showAuthorizephone: that.data.showAuthorizephone});
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
    getPhone(){
      var that = this;
      wx.login({
        success(res) {
            var data = {
              code: res.code,
              encryptedData: that.data.phoneencryptedData,
              iv: that.data.phoneiv
            }
            util.request('lanmao/mp/user/phone/bind', 'POST', data, '', (loginres) => {
              wx.hideLoading()
              if (loginres.data.errorCode == 0) {
                that.setData({
                  showAuthorizephone: false
                })
                that.triggerEvent('myevent', { source: that.data.source});
                // that.triggerEvent('phonevent', { showAuthorizephone: that.data.showAuthorizephone});
              } else if (loginres.data.errorCode == 5001) {
                that.onLogin('getPhone');
              }
            })
        },
        fail: function (res) {
        }
      })
    },
    getphonenumber(e) {
      this.setData({
        isDisabled: true
      })
      //登录
      if (e.detail.encryptedData && e.detail.iv) {
          this.setData({
            phoneencryptedData: e.detail.encryptedData,
            phoneiv: e.detail.iv
          })
          wx.showToast({
            title: '授权成功',
            icon: 'success',
            duration: 1500
          })
        this.getPhone()
      } else {
        this.setData({
          isDisabled: false
        })
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
    // 手机号注册end
    closeAuthorize(){
      this.setData({
        showAuthorize: false
      })
    },
    getguidimg(){
      var that = this;
      wx.login({
        success(res) {
          if (res.code) {
            if(wx.getStorageSync('inviteUserId')){
              that.setData({
                inviteUserId: wx.getStorageSync('inviteUserId'),
                inviteType: wx.getStorageSync('inviteType')
              })
            }
            var code =  res.code;
            var appid = util.appId;
            util.request('lanmao/mp/user/reg/guide/img?appid='+appid+'&code='+code, 'GET', '', '', (res) => {
              wx.hideLoading()
              if (res.data.errorCode == 0) {
                that.setData({
                  posterid: res.data.data.id,
                  bacImg: res.data.data.imgUrl
                })
              }
            })
          }
        }
      })
     
    },
     //登录
   onLogin(source) {
    var that = this;
    wx.showLoading({
      title: '',
      mask: true
    })
    wx.login({
      success(res) {
        if (res.code) {
          var data = {
            code: res.code,
            appid: util.appId
          }
          util.request('lanmao/mp/user/login', 'POST', data, '', (loginres) => {
            wx.hideLoading()
            if (loginres.data.errorCode == 0) {
              wx.setStorageSync('token', loginres.data.data.token)
              wx.setStorageSync('loginInfo', JSON.stringify(loginres.data.data))
              that.setData({
                userId: loginres.data.data.userId,
                showAuthorize: false,
                isDisabled: false
              })
            }else if (loginres.data.errorCode == 5010) { //重新获取code,弹框授权获取用户信息
              that.setData({
                showAuthorize: true
              })
            }
          })
        }
      },
      fail: function (res) { }
    })
  },
  getphoneInfo(source){
    var that = this;
    util.request('lanmao/mp/user/user/info', 'GET', '', '', (loginres) => {
      wx.hideLoading()
      if (loginres.data.errorCode == 0) {
        wx.setStorageSync('userId', loginres.data.data.id)
        if (!loginres.data.data.phone){
          that.setData({
            showAuthorizephone: true,
          })
        }else{
          that.triggerEvent('myevent', { source: that.data.source});
        }
      } 
    })
  },
   //获取用户信息
   getInfo() {
    var that = this;
    wx.login({
      success(res) {
        wx.getUserInfo({
          lang: 'zh_CN',
          success: response => {
            that.setData({
              regInfo: {
                rawData: response.rawData,
                signature: response.signature,
                encryptedData: response.encryptedData,
                iv: response.iv
              }
            })
            that.userReg(res.code);
          }
        })
      }
    })
  },
  userReg(code) { //用户注册
    var that = this;
    wx.showLoading({
      title: '',
      mask: true
    })
    var inviteUserId = '';
    if(that.data.inviteUserId){
      inviteUserId = that.data.inviteUserId;
    }
    var regdata = {
      code: code,
      encryptedData: that.data.regInfo.encryptedData,
      iv: that.data.regInfo.iv,
      rawData: that.data.regInfo.rawData,
      signature: that.data.regInfo.signature,
      appid: util.appId,
      inviteUserId: inviteUserId,
      inviteType: that.data.inviteType
    }
    util.request('lanmao/mp/user/reg', 'POST', regdata, '', (regres) => {
      wx.hideLoading()
      if (regres.data.errorCode == 0) {
        wx.removeStorageSync('inviteUserId')
        wx.removeStorageSync('inviteType')
        that.completeReg()
        wx.setStorageSync('createDate', regres.data.data.createDate)
        wx.setStorageSync('token', regres.data.data.token)
        wx.setStorageSync('loginInfo', JSON.stringify(regres.data.data))
        that.setData({
          userId: regres.data.data.userId,
          showAuthorize: false,
          isDisabled: false
        })
        that.getphoneInfo()
        // wx.setStorageSync('token', regres.data.data.token);
        // that.onLogin()
        // that.triggerEvent('myevent', { source: that.data.source});
      }else{
        that.setData({
          isDisabled: false
        })
      }
    })
  },
  completeReg(){
    util.request('lanmao/mp/user/reg/guide/img/complete?id='+this.data.posterid, 'POST', '', '', (regres) => {
      wx.hideLoading()
      if (regres.data.errorCode == 0) {
       
      }else{
       
      }
    })
    
  },
  getUserInfo(e) {
    this.setData({
      isDisabled: true
    })
    //登录
    if (e.detail.userInfo) {
      App.globalData.userInfo = e.detail.userInfo
      if (!this.data.userInfo) {
        this.setData({
          userInfo: e.detail.userInfo,
          hasUserInfo: true
        })
        wx.showToast({
          title: '授权成功',
          icon: 'success',
          duration: 1500
        })
      }
      this.getInfo()
    } else {
      this.setData({
        isDisabled: false
      })
      wx.showModal({
        title: '提示',
        content: '若不授权微信登录，则无法使用小程序。点击"授权"按钮并允许使用"用户信息"方可正常使用。',
        showCancel: false,
        confirmText: '授权',
        success: (res => {
          wx.openSetting({
            success: (res) => {}
          })
        })
      })
    }
  }

  }
})
