// pages/enhancedLoading/enhancedLoading.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    headIcon: null,
    showxieyi: false,
    content: null,
    xieyitop: null,
    glcontent: null,
  },
  onShow(){
    var device = wx.getSystemInfoSync();
    this.setData({
      xieyitop: (device.windowHeight - 460) / 2
    })
  },
  onLoad(){
    this.getGl()
  },
  yinsi(){
    this.getXiyi('3')
  },
  closeXieyi(){
    this.setData({
      showxieyi: false,
      content: null
    })
  },
  getGl(){
    util.request('lanmao/protocol/4', 'GET', '', '', (loginres) => {
      wx.hideLoading()
      if (loginres.data.errorCode == 0) {
        loginres.data.data.content =  loginres.data.data.content.replace(/\<p/gi, '<p class="rich-p" ');//正则给p标签增加class
        this.setData({
          glcontent: loginres.data.data.content
        })
      } else if (loginres.data.errorCode == 5001) {
        this.onLogin('getGl');
      }
    })
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
        this.onLogin('yinsi');
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
               if(soure == 'yinsi'){
                that.yinsi()
              }else if(soure == 'getGl'){
                that.getGl()
              }
            }else if (loginres.data.errorCode == 5010) { //重新获取code,弹框授权获取用户信息
             
            }
          })
        }
      },
      fail: function (res) { }
    })
  },

})
