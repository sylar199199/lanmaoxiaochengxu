const util = require('../../utils/util.js');
Page({
  data: {
    color: '#e15a4c',
    activityId: '',
    goodsId: '',
    adressList: [],
  
  },
  onLoad: function (options) {
    this.setData({
      activityId: options.activityId,
      goodsId: options.goodsId
    })
  },
  onShow(){
    this.getAdress()
  },
  selectAdress(e){//选择收货地址
    if (this.data.activityId !== 'undefined' && this.data.activityId){
    
      var id = e.currentTarget.dataset.id;
      wx.setStorageSync('adressId',id)
      wx.navigateBack({
        url: '/pages/confirmOrder/confirmOrder?goodsId=' + this.data.goodsId + '&activityId=' + this.data.activityId,

      })
    }
  },
  goeditorAdress(e){
    console.log(e)
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/editorAdress/editorAdress?goodsId=' + this.data.goodsId + '&activityId=' + this.data.activityId+'&id='+id,
    })
  },
  goEditorAdress(){
    wx.navigateTo({
      url: '/pages/editorAdress/editorAdress?goodsId=' + this.data.goodsId + '&activityId=' + this.data.activityId,
    })
  },
  catchtap(){},
  deleteAdress(e){
    var id = e.currentTarget.dataset.id;
    util.request('lanmao/mp/user/address/'+id, 'DELETE', '', '', (reg) => {
      if (reg.data.errorCode == 0) {
        this.getAdress()
        wx.showToast({
          title: '删除成功',
          icon: 'none'
        })
      } else if (reg.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  geTel(tel) {
    var reg = /^(\d{3})\d{4}(\d{4})$/;
    return tel.replace(reg, "$1****$2");
  },
  getAdress(){
    util.request('/lanmao/mp/user/address', 'GET', '', '', (reg) => {
      if (reg.data.errorCode == 0) {
        var data = reg.data.data;
        for(let i in data){
          data[i].tel = this.geTel(data[i].tel)
        }
        this.setData({
          adressList: reg.data.data
        })
      } else if (reg.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  onLogin() {
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
              that.getAdress()
            }
          })
        }
      },
      fail: function (res) { }
    })
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setDefault(e.detail.value)
  },
  setDefault(id){
    util.request('lanmao/mp/user/address/default/'+id, 'POST', '', '', (reg) => {
      if (reg.data.errorCode == 0) {
        this.getAdress()
      } else if (reg.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  }
})
