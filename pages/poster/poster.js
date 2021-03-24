// pages/poster.js
import { base64src } from '../../utils/base64src.js'
const util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    testtrue: true,
    selectId: '',
    raw: null,
    contentheight: null,
    top: 0,
    preurl: '',
    scrollLeft: 0,
    couponData: [{name: '专属海报'}],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success:function (res) {
        console.log(res.windowWidth)
        var raw = 750 / res.windowWidth;
        var wh = (res.windowHeight * raw)//将高度乘以换算后的该设备的rpx与px的比例
        var contenth = wh - 284;
        console.log(wh,raw) //最后获得转化后得rpx单位的高度
        that.setData({
          raw: raw,
          contentheight: contenth,
          top: (contenth-875)/2
        })
      }
    }) 
    this.getPoster()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onShareAppMessage: function() {
    var  nickName = '';
    if(wx.getStorageSync('loginInfo')){
      nickName = JSON.parse(wx.getStorageSync('loginInfo')).nickname;
      if(nickName.length > 2){
        nickName = nickName.substring(0,2)
      }
    }
    if(wx.getStorageSync('userId')){
      var pathstr = `/pages/home/home?inviteUserId=` + wx.getStorageSync('userId')+'&inviteType=1';
    }else{
      var pathstr = '/pages/home/home?inviteType=1';
    }
    return {
      title: nickName+"给你发了一个积分红包点击领取,超低价兑换盲盒",
      path: pathstr,
      imageUrl: 'https://oss.ifxj.com/lanmao/health/zhuanfa1.jpg?'+Date.parse(new Date())
    }
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
    // var that = this;
    // wx.getSystemInfo({
    //   success:function (res) {
    //     console.log(res.windowWidth)
    //     var raw = 750 / res.windowWidth;
    //     var wh = (res.windowHeight * raw)//将高度乘以换算后的该设备的rpx与px的比例
    //     var contenth = wh - 284;
    //     console.log(wh,raw) //最后获得转化后得rpx单位的高度
    //     that.setData({
    //       raw: raw,
    //       contentheight: contenth,
    //       top: (contenth-875)/2
    //     })
    //   }
    // }) 
    // this.getPoster()
  },
  //获取海报模板
    getPoster(){
      util.request('lanmao/mp/poster', 'get', '', '', (res) => {
        var data = res.data.data;
        for (var i = 0; i < data.length; i++) {
          data[i].isSelected = false;
          if (i == 0) {
            data[i].isSelected = true;
            this.setData({
              selectId:  data[i].id
            })
            this.getnewPoster()
          }
        }
        this.setData({
          "sceneList": data
        })
      })
    },
    //点击获取海报模板
    _evalutionItemClick: function (e) {
      var id = e.currentTarget.dataset.item.id;
      this.setData({
        selectId: id
      })
      var curIndex = 0;
      this.getnewPoster()
      for (var i = 0; i < this.data.sceneList.length; i++) {
        if (id == this.data.sceneList[i].id) {
          this.data.sceneList[i].isSelected = true;
        } else {
          this.data.sceneList[i].isSelected = false;
        }
      }
      this._handleevalutionScroll(id);
      this.setData({
        sceneList: this.data.sceneList,
      })
    },
    //获取用户海报图
    getnewPoster(){
      wx.showLoading({
        title: '海报生成中...',
        mask: true
      })
      var id = this.data.selectId;
      util.request('lanmao/mp/poster/'+id+'/img', 'POST', '', '', (res) => {
        if (res.data.errorCode == 0){
           var data = 'data:image/jpg;base64,' + res.data.data;
           this.setData({
            preurl: data
          })
         console.log(this.data.preurl)
          wx.hideLoading();
        }else if (res.data.errorCode == 5001){
          wx.hideLoading();
            this.onLogin('getnewPoster')
        }
      })
    },
      //登录
  onLogin(type) {
    console.log(type)
    var that = this;
    wx.login({
      success(res) {
        if (res.code) {
          var data = {
            code: res.code,
            appid: util.appId
          }
          util.request('lanmao/mp/user/login', 'POST', data, '', (loginres) => {
            if (loginres.data.errorCode == 5010) { //重新获取code,弹框授权获取用户信息
              that.setData({
                showAuthorize: true
              })
              // that.getuserInfo()
            } else if (loginres.data.errorCode == 0) {
              wx.setStorageSync('token', loginres.data.data.token)
              wx.setStorageSync('loginInfo', JSON.stringify(loginres.data.data))
              that.setData({
                userId: loginres.data.data.id,
                navBarName: loginres.data.data.nickname
              })
              if(type == 'getnewPoster'){
                that.getnewPoster()
              }else if(type == 'isUserwritePhotos'){
                that.isUserwritePhotos()
              }
            }
          })
        }
      },
      fail: function(res) {}
    })
  },
    _handleevalutionScroll(selectedId) {
      var _this = this;
      var query = wx.createSelectorQuery();//创建节点查询器
      query.select('#scroll-item-' + selectedId).boundingClientRect();//选择id='#item-' + selectedId的节点，获取节点位置信息的查询请求
      query.select('#scroll-view_h').boundingClientRect();//获取滑块的位置信息
      //获取滚动位置
      query.select('#scroll-view_h').scrollOffset();//获取页面滑动位置的查询请求
      query.exec(function (res) {
        _this.setData({
          scrollBoxLeft: res[2].scrollLeft + res[0].left + res[0].width / 2 - res[1].width / 2
        });
      });
    },
    //保存海报
    savePhone(){
      this.setData({
        testtrue: false
      })
      var that = this;
      clearTimeout(_timer);
      var _timer = setTimeout(function(){
        that.setData({
          testtrue: true
        })
      },300)
      this.isUserwritePhotos()
    },
      //判断是否授权保存到相册
  isUserwritePhotos() {
   
    var that = this;
    wx.getSetting({//判断是否授权相机信息
      success(res) {
        console.log(res.authSetting['scope.writePhotosAlbum'])
        if (!res.authSetting['scope.writePhotosAlbum']) {
        
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {//用户同意授权
              var preurl = that.data.preurl;
              var id = that.data.selectId;
              
              util.request('lanmao/mp/poster/'+id+'/save', 'POST', '', '', (res) => {
                if (res.data.errorCode == 0){
                  base64src(preurl, res => {
                    console.log(res)
                    var resurl = res
                    var timestamp = new Date().getTime();
                    wx.saveImageToPhotosAlbum({
                      filePath: resurl,
                      success(res) {
                       
                        wx.showToast({
                          title: '已保存在相册中',
                          mask: true
                        })
                       }
                    })
                  });
                }else if (res.data.errorCode == 5001){
                  wx.hideLoading();
                    that.onLogin('isUserwritePhotos')
                }
              })
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '若不授权微信登录，则无法使用小程序。点击"授权"按钮并允许使用"保存到相册"方可正常使用。',
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
          })
        } else {//
          // var index = that.data.preurl.indexOf('?');
          var preurl = that.data.preurl;
          var id = that.data.selectId;
          util.request('lanmao/mp/poster/'+id+'/save', 'POST', '', '', (res) => {
            if (res.data.errorCode == 0){
              base64src(preurl, res => {
                console.log(res)
                var resurl = res
                var timestamp = new Date().getTime();
                wx.saveImageToPhotosAlbum({
                  filePath: resurl,
                  success(res) {
                   
                    wx.showToast({
                      title: '已保存在相册中',
                      mask: true
                    })
                   }
                })
              });
            }else if (res.data.errorCode == 5001){
              wx.hideLoading();
                this.onLogin('isUserwritePhotos')
            }
          })
        
         
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})