const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: '',
    content: '',
    showData: false,
    percent: '',
    userId: '',
    productList: [],
    timeItem: [],
    showAuthorizephone: false,
    showAuthorize: false,
    showxieyi: false,
    source: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.inviteUserId) {
   
      wx.setStorageSync('inviteUserId',this.data.inviteUserId)
      wx.setStorageSync('inviteType',this.data.inviteType)
      this.setData({
        inviteUserId: options.inviteUserId,
        inviteType: options.inviteType,
        showAuthorize: true
      })
    }
    // var device = wx.getSystemInfoSync();
    // this.setData({
    //   top: (device.windowHeight - 250) / 2,
    //   xieyitop: (device.windowHeight - 460) / 2
    // })
    // this.getProductList()
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
    this.getProductList()
  },
 //监听组件传来的消息
 onevent(e){
    if(e.detail.source == 'getHomeInfo'){
      this.getHomeInfo();
    }else if(e.detail.source == 'goPublish'){
      this.goPublish()
    }
  },
    //监听获取手机号组件传来的消息
    phonevent(e){
      if(!e.detail.showAuthorizephone ){
        this.getProductList()
      }
    },
  getInfo(goodsId, activityId){
    var that = this;
    util.request('lanmao/mp/user/user/info', 'GET', '', '', (loginres) => {
      wx.hideLoading()
      if (loginres.data.errorCode == 0) {
        wx.setStorageSync('userId', loginres.data.data.id)
        wx.setStorageSync('createDate', loginres.data.data.createDate)
        if (!loginres.data.data.phone){
          wx.login({
            success(res) {
              that.setData({
                  code: res.code,
                  showAuthorizephone: true,
                })
            },
            fail: function (res) {
            }
          })
        }else{
          that.setData({
            showAuthorizephone: false
          })
          wx.navigateTo({
            url: '/pages/productDetail/productDetail?goodsId=' + goodsId + '&activityId=' + activityId
          })
        }
      } else if (loginres.data.errorCode == 5001) {
        that.onLogin()
        
      }
    })
  },
  // onShareAppMessage: function () {
  //   return {
  //     title: "在吗？我正在兑换新品盲盒，请点击为我助力",
  //     path: `/pages/activitylist/activitylist?inviteUserId=` + wx.getStorageSync('userId')+'&inviteType=2',
  //     imageUrl: 'https://oss.ifxj.com/lanmao/health/zhuanfa.jpg?'+Date.parse(new Date())
  //   }
  // },
  changeCount(type) {
    // 目标时区，东8区
    const targetTimezone = -8;
    // 当前时区与中时区时差，以min为维度
    const dif = new Date().getTimezoneOffset();
    // 本地时区时间 + 本地时区时差  = 中时区时间
    // 目标时区时间 + 目标时区时差 = 中时区时间
    // 目标时区时间 = 本地时区时间 + 本地时区时差 - 目标时区时差
    // 东8区时间
    const east9time = new Date().getTime() + dif * 60 * 1000 - (targetTimezone * 60 * 60 * 1000);
    // console.log('new Date(east9time)', dif, new Date(east9time).getHours());
    if (type == 'day') {
      return new Date(east9time).getDate()
    } else if (type == 'hours') {
      return new Date(east9time).getHours()
    } else if (type == 'minutes') {
      return new Date(east9time).getSeconds()
    } else if (type == 'secondes') {
      return new Date(east9time).getSeconds()
    } else if (type == 'times') {
      return east9time
    }
  },
  getTime(item, i, productList) {
    if (!item) {
      productList = [];
      clearInterval(timer);
      this.setData({
        productList: []
      })
      return;
    }
    var dealinTime = item.endTime;
    var that = this;
    var timer = setInterval(function() {
      var timestamp = new Date().getTime();
      var time1 = parseInt((dealinTime - timestamp) / 1000);
      var day = parseInt(time1 / 60 / 60 / 24),
        hour = parseInt(time1 / 3600) % 24 > 9 ? parseInt(time1 / 3600) % 24 : '0' + parseInt(time1 / 3600) % 24,
        minute = parseInt(time1 / 60 % 60) > 9 ? parseInt(time1 / 60 % 60) : '0' + parseInt(time1 / 60 % 60),
        second = parseInt(time1 % 60) > 9 ? parseInt(time1 % 60) : '0' + parseInt(time1 % 60);
      // time1--;
      if (time1 <= 0) {
        clearInterval(that.data.timeItem[i]);
        productList[i].isShow = false;
        that.setData({
          productList: productList
        })
      }else{
          productList[i].day = day;
          productList[i].hour = hour;
          productList[i].minute = minute;
          productList[i].second = second;
          that.setData({
            productList: productList
          })
      }
    }, 1000)
    var timeItem = this.data.timeItem;
    timeItem.push(timer)
    this.setData({
      timeItem: timeItem
    })
  },
  getProductList() {
    // wx.showLoading({
    //   title: '',
    //   mask: true
    // })
    if (this.data.timeItem.length != 0) {
      for (var i = 0; i < this.data.timeItem.length; i++) {
        clearInterval(this.data.timeItem[i]);
      }
    }
    util.request('lanmao/redeem/activity', 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        var productList = res.data.data;
        if (productList.length != 0){
          this.setData({
            showData: true
          })
          for (let i in productList) {
            for (let j in productList[i].goods){
              if (productList[i].goods[j].name.length >15){
                productList[i].goods[j].name = productList[i].goods[j].name.substring(0, 15)+'...'

              }
              if (productList[i].goods[j].salesVolume){
                var percent = this.getPercent(productList[i].goods[j].salesVolume, productList[i].goods[j].stock);
                productList[i].goods[j].percent = percent;
              }
            }
            productList[i].isShow = true; 
            this.getTime(productList[i], i, productList)
          }
        }else{
          this.setData({
            productList: [],
            showData: true
          })
        }
        wx.hideLoading()
      } else if (res.data.errorCode == 5001) {
        wx.hideLoading()
        this.onLogin();
      }
    })
  },
  getPercent(num, num1) {
    num = parseFloat(num);
    num1 = parseFloat(num1);
    var total =  parseFloat(num + num1);
    if (isNaN(num) || isNaN(total)) {
      return "-";
    }
    return total <= 0 ? "0%" : (Math.round(num / total * 100)) + "%";
  },
  goDetail(e){
    var goodsId = e.currentTarget.dataset.goodsid,
      activityId = e.currentTarget.dataset.activityid;
      this.getInfo(goodsId,activityId)
   
  },
  //登录
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
              that.setData({
                userId: loginres.data.data.userId
              })
              that.onShow()
            }else if (loginres.data.errorCode == 5010) { //重新获取code,弹框授权获取用户信息
              that.setData({
                showAuthorize: true
              })
            }
          })
        }
      },
      fail: function(res) {}
    })
  },
 
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onHide() {
    for (var i = 0; i < this.data.timeItem.length; i++) {
      clearInterval(this.data.timeItem[i]);
    }
  },
  onUnload: function() {
    for (var i = 0; i < this.data.timeItem.length; i++) {
      clearInterval(this.data.timeItem[i]);
    }

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
  
})