// pages/enhancedLoading/enhancedLoading.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    noData: false,
    consignee: null,
    mark: '',
    showexDetail: false,
    timeItem: [],
    time: '',
    express: null,
    top: 0,
    showexpress: false,
    currentIndex: 0,
    status: '',
    tabData: [{ name: '全部', status: '' }, { name: '待发货', status: '2' }, { name: '待收货', status: '3' },{ name: '已完成', status: '4' }],
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
  pagechange: function (e) {
    if ("touch" === e.detail.source) {
      let currentPageIndex = this.data.currentIndex
      currentPageIndex = (currentPageIndex + 1) % 2
      this.setData({
        currentIndex: currentPageIndex
      })
    }
  },
  //用户点击tab时调用
  titleClick: function (e) {
      this.setData({
        //拿到当前索引并动态改变
        currentIndex: e.currentTarget.dataset.idx,
        status: e.currentTarget.dataset.status,
        page: 1
      })
    this.getInfo()
  },
  onShow() {
    var device = wx.getSystemInfoSync();
    this.setData({
      top: (device.windowHeight - 160) / 2,
      top1: (device.windowHeight - 260) / 2
    })
    if (wx.getStorageSync('loginInfo')) {
      this.setData({
        headIcon: JSON.parse(wx.getStorageSync('loginInfo')).headImageUrl
      })
    }
    this.getInfo();
  },
  timetrans(timestamp) {
    var getSeconds = '', getMinutes = '', getHours = '';
    var d = new Date(timestamp);
    getHours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    getMinutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();;
    getSeconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();;
    var newTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + getHours + ':' + getMinutes + ':' + getSeconds;
    return newTime
  },
  getconsignee(e){
    this.setData({
      consignee: e.currentTarget.dataset.consignee,
      mark: e.currentTarget.dataset.mark,
      showexDetail: true,
    })
  },
  getExpress(e){
    this.setData({
      express: e.currentTarget.dataset.express,
      time: this.timetrans(e.currentTarget.dataset.express.createDate),
      showexpress: true,
    })
  },

  payOrder(e) {
    var id = e.currentTarget.dataset.item.id;
    util.request('lanmao/order/' + id + '/pay', 'POST', '', '', (payres) => {
      if (payres.data.errorCode == 0) {
        wx.requestPayment({
          timeStamp: payres.data.data.timeStamp,
          nonceStr: payres.data.data.nonceStr,
          package: payres.data.data.packageValue,
          signType: 'MD5',
          paySign: payres.data.data.paySign,
          success(res) {
            wx.navigateTo({
              url: '/pages/paySucess/paySucess',
            })
            wx.removeStorageSync('selectGoodsProduct' + this.data.activityId)
          },
          fail(res) { }
        })

      } else if (payres.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  closeExpress(){
    this.setData({
      express: null,
      showexpress: false,
      showexDetail: false,
    })
  },
  copyText: function (e) {
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '运单号已复制成功',
              icon: 'none'
            })
          }
        })
      }
    })
  },
  getInfo: function () {
    // var that = this;
    var data = {
      page: this.data.page,
      size: this.data.pageSize,
      status: this.data.status
    }
    util.request('lanmao/order/query', 'POST', data, '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 5001) {//重新获取code,弹框授权获取用户信息
        this.onLogin()
      } else if (res.data.errorCode == 0) {
        wx.hideLoading();
       
        var contentlistTem = this.data.contentlistItem;
        if (this.data.page == 1) {
          this.setData({
            contentlistTem: [],
            contentlist: []
          })
          contentlistTem = []
        }

        var contentlist = res.data.data.records;
        var content = contentlistTem.concat(contentlist);
        if(content.length != 0){
          for(let i in content){
            content[i].isShow = false;
            if (content[i].name > 25){
              content[i].name = content[i].name.substirng(0,25)+'...';
            }
            if (content[i].specName > 25) {
              content[i].specName = content[i].specName.substirng(0, 25) + '...';
            }
            if (content[i].status == '4'){
              content[i].statiusText = '已完成'
            } else if (content[i].status == '3') {
              content[i].statiusText = '待收货'
            } else if (content[i].status == '2') {
              content[i].statiusText = '待发货'
            } else if (content[i].status == '1') {
              content[i].isShow = true;
              content[i].statiusText = '待支付';
            } else if (content[i].status == '5') {
              content[i].statiusText = '交易关闭'
            }
          }
        }
        this.setData({
          contentlistItem: content
        })
        console.log(content)
        if (contentlist.length < this.data.pageSize) {
          this.setData({
            contentlist: content,
            hasMoreData: false,
            searchLoading: false,
            searchLoadingComplete: true
          })
        } else {
          this.setData({
            contentlist: content,
            hasMoreData: true,
            page: this.data.page + 1
          })
        }
        var contentlist = this.data.contentlist;
        for(let i in contentlist){
          contentlist[i].hour = '';
          contentlist[i].minute = '';
          contentlist[i].second = '';
         
          if (contentlist[i].status == '1') {
            contentlist[i].statiusText = '待支付';
            contentlist[i].isShow = true;
            this.getTime(contentlist[i], i, contentlist)
          } 
        }
        console.log(this.data.contentlist)
        if(this.data.contentlist.length == 0){
          this.setData({
            noData: true
          })
         
        }else{
          this.setData({
            noData: false
          })
         
        }
      }
    })
  },
  getTime(item, i, listItem) {
    if (!item) {
      clearInterval(timer);
      return;
    }
    var dealinTime = item.paymentDeadline;
    var that = this;
    var timer = setInterval(function() {
      var timestamp = new Date().getTime();
      var time1 = parseInt((dealinTime - timestamp) / 1000);
      var hour = parseInt(time1 / 3600) % 24 > 9 ? parseInt(time1 / 3600) % 24 : '0' + parseInt(time1 / 3600) % 24,
        minute = parseInt(time1 / 60 % 60) > 9 ? parseInt(time1 / 60 % 60) : '0' + parseInt(time1 / 60 % 60),
        second = parseInt(time1 % 60) > 9 ? parseInt(time1 % 60) : '0' + parseInt(time1 % 60);
      // time1--;
      if (time1 <= 0) {
        clearInterval(that.data.timeItem[i]);
        listItem[i].isShow = false;
        listItem[i].statiusText = '订单关闭';
        that.setData({
          contentlist: listItem
        })
        console.log(that.data.contentlist)
      }else{
          listItem[i].hour = hour;
          listItem[i].minute = minute;
          listItem[i].second = second;
          that.setData({
            contentlist: listItem
          })
      }
    }, 1000)
    var timeItem = this.data.timeItem;
    timeItem.push(timer)
    this.setData({
      timeItem: timeItem
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
  // timetrans(d) {
  //   var d = new Date(d);
  //   var getSeconds = '', getMinutes = '', getHours = '', getDate = '', getMonth = '';
  //   getMonth = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
  //   getDate = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
  //   getSeconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
  //   var newTime = getMonth + '月' + getDate + '日';
  //   return newTime
  // },
  gettimetrans(d) {
    console.log(d)
    var d = new Date(d);
    var getSeconds = '', getMinutes = '', getHours = '', getDate = '', getMonth = '';
    getMonth = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
    getDate = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
    getSeconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
    var newTime = d.getFullYear() + '年' + getMonth + '月' + getDate + '日';
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
          console.log()
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
