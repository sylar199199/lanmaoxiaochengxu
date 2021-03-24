// components/navbar/index.js
const util = require('../../utils/util.js');
const App = getApp();
Component({
  options: {
    addGlobalClass: true,
  },
  externalClasses: ['custom-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    pageName: String,
    tabIndex: {
      type: Number,
      observer(newVal, oldVal) {
        this.setData({
          tabIndex: newVal
        })
      }
    },
  
    navTab:{
      type: Array,
      value: ['发现','关注','活动']
    },
    showNav: {
      type: Boolean,
      value: true
    },
    bgColor: {
      type: String,
      value: 'rgba(255,255,255)'
    },
    iconColor: {
      type: String,
      value: '#000'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    navHeight: '80',
    navTop: '',
    tabIndex: 0,
    addpublish: '',
  },
  lifetimes: {
    attached: function () {
      this.setData({
        addpublish: "https://ifxj.oss-cn-shenzhen.aliyuncs.com/lanmao/health/addpublish.png?"+Date.parse(new Date()),
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    goPublish(){
      this.getInfo('goPublish')
     },
     getInfo(source){
       var that = this;
       util.request('lanmao/mp/user/user/info', 'GET', '', '', (loginres) => {
         wx.hideLoading()
         if (loginres.data.errorCode == 0) {
           wx.setStorageSync('userId', loginres.data.data.id)
           if (!loginres.data.data.phone){
          
             wx.login({
               success(res) {
                 that.setData({
                     code: res.code,
                     showAuthorizephone: true,
                   })
                   that.triggerEvent('isbindPhone', { showAuthorizephone: true,code: res.code});
               },
               fail: function (res) {
               }
             })
           }else{
             that.setData({
               showAuthorizephone: false
             })
             if(source == 'goPublish'){
               wx.navigateTo({
                 url: '/pages/releasedynamics/releasedynamics'
               })
             }
            
           }
         } else if (loginres.data.errorCode == 5001) {
           this.onLogin(source);
         }
       })
     },
    //登录
    onLogin(soure) {
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
                  userId: loginres.data.data.userId
                })
                if(soure == 'goPublish'){
                  wx.navigateTo({
                    url: '/pages/releasedynamics/releasedynamics'
                  })
                }else if(soure == 'loadImages'){
                  that.loadImages()
                }
              }else if (loginres.data.errorCode == 5010) { //重新获取code,弹框授权获取用户信息
                if(soure == 'goPublish'){
                  that.setData({
                    source: 'goPublish'
                  })
                }else if(soure == 'loadImages'){
                  that.setData({
                    source: 'loadImages'
                  })
                }
                that.triggerEvent('isregister', { showAuthorize: true});
              }
            })
          }
        },
        fail: function (res) { }
      })
    },
    currentTab: function (e) {
      if (this.data.tabIndex == e.currentTarget.dataset.idx) {
        return;
      }
      this.setData({
        tabIndex: e.currentTarget.dataset.idx
      })
      this.triggerEvent('changeTab', {
        value: e.currentTarget.dataset.idx
      })
      //传给社区页面
    },
    goCommunity() {
      wx.switchTab({
        url: '/pages/community/community',
      })
    },
    //回退
    _navBack: function () {
      wx.navigateBack({
        delta: 1
      })
    },
    //回主页
    _toIndex: function () {
      wx.switchTab({
        url: '/pages/tabBar/index/index'
      })
    },
  }
})
