// pages/enhancedLoading/enhancedLoading.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    headIcon: null,
    accumPoints: 0,
    contentlistLength: 0,
    page: 1,
    pageSize: 15,
    hasMoreData: true,
    contentlist: [],
    contentlistItem: [],
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false //“没有数据”的变量，默认false，隐藏  
  },
  onShow(){
    if (wx.getStorageSync('loginInfo')) {
      this.setData({
        headIcon: JSON.parse(wx.getStorageSync('loginInfo')).headImageUrl
      })
    }
    this.getInfo();
    this.getGouqi()
  },
  getGouqi() {
    util.request('lanmao/mp/home/points', 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        var accumPoints = res.data.data.totalPoints;
        // if (accumPoints > 10000) {
        //   accumPoints = (accumPoints / 10000).toFixed(2) + '万';
        // }
        this.setData({
          accumPoints: accumPoints
        })
      } else if (res.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  getInfo: function () {
    var that = this;
    var data = {
      page: that.data.page,
      size: that.data.pageSize
    }
    util.request('lanmao/mp/home/points/log', 'POST', data, '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 5001) {//重新获取code,弹框授权获取用户信息
        that.onLogin()
      } else if (res.data.errorCode == 0) {
        wx.hideLoading();
        var contentlistTem = that.data.contentlistItem;
        if (that.data.page == 1) {
           contentlistTem = []
        }
        var contentlist = res.data.data.records;
        var content = contentlistTem.concat(contentlist);
        that.setData({
          contentlistItem: content
        })
        var contentArr = [];
        var arr = [];
        for (var i = 0; i < content.length;i++){
          if (content[i + 1]){
            if (this.gettimetrans(content[i].createDate) == this.gettimetrans(content[i + 1].createDate)) {
              content[i].time = that.timetrans(content[i].createDate)
              arr.push(content[i])
            } else {
              content[i].time = that.timetrans(content[i].createDate)
              arr.push(content[i])
              var contentObj = {};
              contentObj.time = content[i].time
              contentObj.logs = arr;
              contentArr.push(contentObj)
              arr = [];
            }
          }else{
            if (content[i - 1]){
              if (this.gettimetrans(content[i].createDate) == this.gettimetrans(content[i - 1].createDate)) {
                content[i].time = that.timetrans(content[i].createDate)
                arr.push(content[i])
                var contentObj = {};
                contentObj.time = content[i].time
                contentObj.logs = arr;
                contentArr.push(contentObj)
              } else {
                content[i].time = that.timetrans(content[i].createDate)
                arr = [];
                arr.push(content[i])
                var contentObj = {};
                contentObj.time = content[i].time
                contentObj.logs = arr;
                contentArr.push(contentObj)
              }
            }else{
              content[i].time = that.timetrans(content[i].createDate)
              arr = [];
              arr.push(content[i])
              var contentObj = {};
              contentObj.time = content[i].time
              contentObj.logs = arr;
              contentArr.push(contentObj)
            }
          }0
        }
        for (let i in contentArr){
          for (let j in contentArr[i].logs){
            if (contentArr[i].logs[j].reason.length > 16){
              contentArr[i].logs[j].reason = contentArr[i].logs[j].reason.substring(0,15)+'...'
            }
          }
        }
        if (contentlist.length < that.data.pageSize) {
          that.setData({
            contentlist: contentArr,
            hasMoreData: false,
            searchLoading: false,
            searchLoadingComplete: false
          })
        } else {
          that.setData({
            contentlist: contentArr,
            hasMoreData: true,
            page: that.data.page + 1
          })
        }
      }
    })
  },
  onLoad: function () {
    var that = this
    // 加载页面初始化时需要的数据
  
  },
  /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
  onPullDownRefresh: function () {
    this.data.page = 1;
    this.setData({
      page: 1,
      searchLoading: true, //"上拉加载"的变量，默认false，隐藏  
      searchLoadingComplete: false //“没有数据”的变量，默认false，隐藏  
    })
    this.getInfo();
  },
  timetrans(d) {
    var d = new Date(d);
    var getSeconds = '', getMinutes = '', getHours = '', getDate = '', getMonth = '';
    getMonth = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
    getDate = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    getSeconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
    var newTime = getMonth + '月' + getDate + '日';
    return newTime
  },
  gettimetrans(d) {
    var d = new Date(d);
    var getSeconds = '', getMinutes = '', getHours = '', getDate = '', getMonth = '';
    getMonth = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
    getDate = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    getSeconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
    var newTime = d.getFullYear()+'年'+getMonth + '月' + getDate + '日';
    return newTime
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      // this.setData({
      //   searchLoading: true//"上拉加载"的变量，默认false，隐藏  
      // })
      this.getInfo();
    } else {
     
    }
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
            if (loginres.data.errorCode == 5010) {//重新获取code,弹框授权获取用户信息
            } else if (loginres.data.errorCode == 0) {
              wx.setStorageSync('token', loginres.data.data.token)
              that.getInfo();
            }
          })
        }
      },
      fail: function (res) {
      }
    })
  },
})
