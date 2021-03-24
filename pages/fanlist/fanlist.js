// pages/enhancedLoading/enhancedLoading.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    showData: false,
    fromName: '',
    careuserid: null,
    hasData: false,
    showAuthorize: false,
    time: '',
    contentlistLength: 0,
    page: 1,
    pageSize: 15,
    hasMoreData: true,
    recData: [],
    contentlist: [],
    contentlistItem: [],
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false //“没有数据”的变量，默认false，隐藏  
  },
  onShow() {
    this.getList();
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
  goCenter(e){
    var userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/userCenter/userCenter?userId='+userId 
    })
  },
  getList: function () {
    var that = this;
    var data = {
      page: that.data.page,
      size: that.data.pageSize,
      userId: that.data.userId
    }
    util.request('lanmao/community/user/fans', 'POST', data, '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 5001) {//重新获取code,弹框授权获取用户信息
        that.onLogin('getList')
      } else if (res.data.errorCode == 0) {
        var contentlistTem = that.data.contentlistItem;
        if (that.data.page == 1) {
          contentlistTem = [];
          
        }
        var contentlist = res.data.data.records;
        var content = contentlistTem.concat(contentlist);
        that.setData({
          showData: true,
          contentlistItem: content
        })
        for(let i in content){
          if(content[i].nickname.length >=12){
            content[i].nickname = content[i].nickname.substring(0,12)+'...'
          }
        
        }
        if(content.length != 0){
          that.setData({
            hasData:true
          })
        }else{
          that.setData({
            hasData:false
          })
        }
        if (contentlist.length < that.data.pageSize) {
          that.setData({
            contentlist: content,
            hasMoreData: false,
            searchLoading: false,
            searchLoadingComplete: true
          })
        } else {
          that.setData({
            contentlist: content,
            hasMoreData: true,
            page: that.data.page + 1
          })
        }
      }
    })
  },
  cancelcare(e){
    var that = this;
    if(e){
      var followed = e.currentTarget.dataset.followed;
      var id = e.currentTarget.dataset.id;
      var index = e.currentTarget.dataset.index;
      var content = e.currentTarget.dataset.content;
      that.setData({
        careuserid: id,
        followed: followed,
        index: index,
        content: content
      })
    }
    wx.showModal({
      title: '',
      content: '是否取关?',
      success: function (sm) {
        if (sm.confirm) {
          util.request('lanmao/community/user/'+that.data.careuserid+'/unfollow', 'POST', '', '', (res) => {
            if (res.data.errorCode == 0) {
              var data = that.data.contentlist;
                for(let i in data){
                  if(i == that.data.index){
                    data[i].followed = false;
                  }
                }
                that.setData({
                  contentlist: data
                })
              
            } else if (res.data.errorCode == 5001) {
              that.onLogin('cancelcare');
            }
          })
          } else if (sm.cancel) {
          }
        }
      })
  },
  care(e){
    if(e){
      var followed = e.currentTarget.dataset.followed;
      var id = e.currentTarget.dataset.id;
      var index = e.currentTarget.dataset.index;
      var content = e.currentTarget.dataset.content;
      this.setData({
        careuserid: id,
        followed: followed,
        index: index,
        content: content
      })
    }
      util.request('lanmao/community/user/'+this.data.careuserid+'/follow', 'POST', '', '', (res) => {
        if (res.data.errorCode == 0) {
          var data = this.data.contentlist;
            for(let i in data){
              if(i == this.data.index){
                data[i].followed = true;
              }
            }
            this.setData({
              contentlist: data
            })
          
        } else if (res.data.errorCode == 5001) {
          this.onLogin('care');
        }
      })
  
  },
  onLoad: function (options) {
    if(options){
      this.setData({
        userId: options.userId
      })
      if(options.fromName){
        this.setData({
          fromName: options.fromName
        })
        wx.setNavigationBarTitle({
          title: 'TA的粉丝'
        })
      }else{
        wx.setNavigationBarTitle({
          title: '我的粉丝' 
        })
      }
    }
    this.getList()
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
    this.getList();
  },
  
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
      this.getList();
    } else {

    }
  },
  onLogin(source) {
    var that = this;
    wx.showLoading({
      title: '',
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
              that.setData({
                showAuthorize: true,
                source: source
              })
            } else if (loginres.data.errorCode == 0) {
              wx.setStorageSync('token', loginres.data.data.token)
              if(source == 'getList'){
                that.getList();
              }else if(source == 'care'){
              that.care();
              }else if(source == 'cancelcare'){
                that.cancelcare();
              }
            }
          })
        }
      },
      fail: function (res) {
      }
    })
  },
})
