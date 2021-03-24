const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAuthorizephone: false,
    showAuthorize: false,
    code: '',
    source: '',
    inviteUserId:'',
    inviteType:'',
    showNew: false,
    showOld: false,
    showImg: false,
    hasGouqi: null,
    description: null,
    popupGuige: false,
    hasBuy: false,
    day: null,
    hour: null,
    minute: null,
    second: null,
    stockConut: false,
    stockConutnum: 0,
    gouqiCount: null,
    price: 0,
    stock: 0,
    specsName: null,
    specsId: '',
    itemImages: [],
    interval: 3000,
    duration: 500,
    autoplay: 'false',
    circular: true,
    indicatorDots: true,
    activity: null,
    imgs: [],
    specs: [],
    maxRegDays: '',
    goodsData: null,
    quantity: 1,
    animate: 'myfirst',
    yesorno: 'none',
    flag: true,
    test: 'closePop',
    activityId: '',
    goodsId: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      activityId: options.activityId,
      goodsId: options.goodsId
    })
    if (options.inviteUserId){
      this.setData({
        inviteUserId: options.inviteUserId
      })
      wx.setStorageSync('inviteUserId',options.inviteUserId)
    }
    if (options.inviteType){
      this.setData({
        inviteType: options.inviteType
      })
      wx.setStorageSync('inviteType',options.inviteType)
    }
   
  },
  onevent(e){
   this.onShow()
  },
  getInfo(){
    var that = this;
    util.request('lanmao/mp/user/user/info', 'GET', '', '', (loginres) => {
      wx.hideLoading()
      console.log(loginres)
      if (loginres.data.errorCode == 0) {
        console.log(loginres.data.data.id)
        wx.setStorageSync('userId', loginres.data.data.id)
        this.setData({
          nickName: loginres.data.data.nickname
        })
        console.log(loginres.data.data.nickname)
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
            showAuthorizephone: false,
            showAuthorize: false,
          })
         
        }
      } else if (loginres.data.errorCode == 5001) {
        that.onLogin('getInfo')
      }
    })
  },
  onShareAppMessage: function () {
    var nickName = this.data.nickName;
    var price = this.data.price;
    var name = this.data.goodsData.goods.name;
    if(nickName.length > 2){
      nickName = nickName.substring(0,2)
    }
    if(name.length > 4){
      name = name.substring(0,4)
    }
    if(wx.getStorageSync('userId')){
      var pathstr = `/pages/productDetail/productDetail?inviteUserId=` + wx.getStorageSync('userId')+'&inviteType=2&activityId='+this.data.activityId+'&goodsId='+this.data.goodsId;
    }else{
      var pathstr = '/pages/productDetail/productDetail?inviteType=2&activityId='+this.data.activityId+'&goodsId='+this.data.goodsId;
    }
    return {
      title: nickName+"正在兑换¥"+price+name+"...,快来一起领走吧",
      path: pathstr,
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // if(wx.getStorageSync('inviteUserId')){
      this.getInfo()
    // }
    this.getDetail();
    
  },
  getUserGouqi(){
    util.request('lanmao/mp/home/points', 'GET', '', '', (loginres) => {
      if (loginres.data.errorCode == 0) {
        this.setData({
          hasGouqi: loginres.data.data.totalPoints
        })
        
      }else if(loginres.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  openPop: function () {
    this.setData({
      yesorno: 'block'
    })

    this.setData({
      test: 'openPop'
    })
    this.setData({
      flag: false
    })
  },
  closePop: function () {
    this.setData({
      test: 'closePop',
    })
    this.setData({
      flag: true
    })
    this.setData({
      yesorno: 'none'
    })
  },
  
  reduceCount() {
    var quantity = this.data.quantity;
    if (this.quantity > 1) {
      this.quantity--;
      this.setData({
        quantity: quantity
      })
    }
  },
  addCount() {
    var quantity = this.data.quantity;
    if (this.data.activity.purchaseLimit != 1){
      if (this.data.quantity < this.data.stock) {
        quantity++;
        this.setData({
          quantity: quantity
        })
      }
    }
  },
  countChange(event) {
    var quantity = event.detail.value;
    // quantity = quantity.replace(/\s/g, "");
    if (quantity < 0) {
      this.setData({
        quantity: 1
      })
      return
    }
    var reg = /^[1-9]\d*$/;
    if (!(reg.test(quantity))) {
      this.setData({
        quantity: 1
      })
      return;
    }
    if (this.data.activity.purchaseLimit == 1) {
      if (quantity > this.data.stock) {
        wx.showToast({
          title: '库存不足',
          icon: 'none',
          duration: 2000
        })
        this.setData({
          quantity: 1
        })
        return;
      }
    }
   
  },
  getTime(dealinTime) {
    var that = this;
    var timer = setInterval(function () {
      var timestamp = new Date().getTime();
      var time1 = parseInt((dealinTime - timestamp) / 1000);
      var day = parseInt(time1 / 60 / 60 / 24),
        hour = parseInt(time1 / 3600) % 24 > 9 ? parseInt(time1 / 3600) % 24 : '0' + parseInt(time1 / 3600) % 24,
        minute = parseInt(time1 / 60 % 60) > 9 ? parseInt(time1 / 60 % 60) : '0' + parseInt(time1 / 60 % 60),
        second = parseInt(time1 % 60) > 9 ? parseInt(time1 % 60) : '0' + parseInt(time1 % 60);
      // time1--;
      if (time1 <= 0) {
        clearInterval(timer);
        that.setData({
          stockConut: false,
          showImg: true
        })
      } else {
        that.setData({
          day: day,
          hour: hour,
          minute: minute,
          second: second,
          stockConut: true
        })
      }
    }, 1000)
    this.setData({
      timer: timer
    })
  },
  seletGuige(e){
    var item = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    var specs = this.data.specs;
    for (let ite of specs) {
      ite.isSelect = false;
    }
    this.setData({
      stock: item.stock,
      specsName: item.name,
      specsId: item.id,
      price: item.price,
      gouqiCount: item.points,
    })
    specs[index].isSelect = true;
    this.setData({
      specs: specs
    })
  },
  resetData() {
    var selectGoodsProduct = wx.getStorageSync('selectGoodsProduct' + this.data.activityId + this.data.goodsId)
    this.setData({
      gouqiCount: selectGoodsProduct.gouqiCount,
      price: selectGoodsProduct.price,
      stock: selectGoodsProduct.stock,
      specsName: selectGoodsProduct.specsName,
      specsId: selectGoodsProduct.specsId,
      quantity: selectGoodsProduct.quantity
    })
  },
  getDetail(){
    util.request('lanmao/redeem/activity/goods?activityId=' + this.data.activityId + '&goodsId=' + this.data.goodsId, 'GET', '', '', (loginres) => {
      if (loginres.data.errorCode == 0) {
        this.setData({
          goodsData: loginres.data.data,
          activity: loginres.data.data.activity,
          imgs: loginres.data.data.goods.imgs
        })
        var currentime = new Date().getTime()
        var createDate = wx.getStorageSync('createDate');
        var maxRegDays = loginres.data.data.activity.maxRegDays;
        var minregday = loginres.data.data.activity.minRegDays;
        this.setData({
          maxRegDays: loginres.data.data.activity.maxRegDays
        })

        if(maxRegDays != 0 && minregday == 0){
          var regTime = createDate+(maxRegDays*24*60*60*1000)
          console.log(regTime,currentime)
          if(regTime>currentime){
            this.setData({
              showNew: true,
              showOld: false,
            })
          }else{
            this.setData({
              showNew: false,
              showOld: false,
            })
          }
        }
        if(maxRegDays == 0 && minregday != 0){
          var regTime = createDate+(minregday*24*60*60*1000)
          console.log(regTime,currentime)
          if(regTime <= currentime){
            this.setData({
              showOld: true,
              showNew: false
            })
          }else{
            this.setData({
              showOld: false,
              showNew: false
            })
          }
        }
        if(maxRegDays == 0 && minregday == 0){
          this.setData({
            showOld: true,
            showNew: false
          })
        }
        var description = this.data.goodsData.goods.description.replace(/<img/g, '<img class="rich-img"')
        description = description.replace(/<p/g, '<p style="width:690rpx;display: block;line-height: 1;margin-top: -3px;"');
        description = description.replace(/style=""/g, '');
        this.setData({
          description: description
        })
        if (wx.getStorageSync('selectGoodsProduct' + this.data.activityId + this.data.goodsId)) {
          var selectGoodsProduct = wx.getStorageSync('selectGoodsProduct' + this.data.activityId + this.data.goodsId)
          this.resetData();
          var num = 0;
          for (let i in loginres.data.data.goods.specs) {
            loginres.data.data.goods.specs[i].isSelect = false;
            if (loginres.data.data.goods.specs[i].stock != 0) {
              if (selectGoodsProduct.specsId == loginres.data.data.goods.specs[i].id){
                loginres.data.data.goods.specs[i].isSelect = true;
                this.setData({
                  gouqiCount: loginres.data.data.goods.specs[i].points,
                  price: loginres.data.data.goods.specs[i].price,
                  stock: loginres.data.data.goods.specs[i].stock,
                  specsName: loginres.data.data.goods.specs[i].name,
                  specsId: loginres.data.data.goods.specs[i].id
                })
                break
              }
            } else {
              num++
            }
          }
        
        } else{
          var num = 0;
          for (let i in loginres.data.data.goods.specs) {
            loginres.data.data.goods.specs[i].isSelect = false;
            if (loginres.data.data.goods.specs[i].stock != 0) {
              loginres.data.data.goods.specs[i].isSelect = true;
              this.setData({
                gouqiCount: loginres.data.data.goods.specs[i].points,
                price: loginres.data.data.goods.specs[i].price,
                stock: loginres.data.data.goods.specs[i].stock,
                specsName: loginres.data.data.goods.specs[i].name,
                specsId: loginres.data.data.goods.specs[i].id
              })
              break
            } else {
              num++
            }
          }
        }
        if (num == loginres.data.data.goods.specs.length) {
          loginres.data.data.goods.specs[0].isSelect = true;
          this.setData({
            gouqiCount: loginres.data.data.goods.specs[0].points,
            price: loginres.data.data.goods.specs[0].price,
            stock: loginres.data.data.goods.specs[0].stock,
            specsName: loginres.data.data.goods.specs[0].name,
            specsId: loginres.data.data.goods.specs[0].id,
            stockConut: false,
            showImg: true
          })
        } else {
          this.getTime(this.data.activity.endTime)
        }
        this.setData({
          specs: loginres.data.data.goods.specs
        })
        this.getUserGouqi();
      } else if (loginres.data.errorCode == 5001){
        this.onLogin();
      }
    })
  },
  goConfirm(){
    let selectGoodsProduct = {
      goodsId: this.data.goodsId,
      activityId: this.data.activityId,
      specsId: this.data.specsId,
      gouqiCount: this.data.gouqiCount,
      price: this.data.price,
      specsName: this.data.specsName,
      marketPrice: this.data.goodsData.goods.marketPrice,
      quantity: this.data.quantity
    }
    if (this.data.stock == 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return;
    } else {
      wx.setStorageSync('selectGoodsProduct' + this.data.activityId + this.data.goodsId, selectGoodsProduct);
      this.closePop()
      wx.navigateTo({
        url: '/pages/confirmOrder/confirmOrder?goodsId=' + this.data.goodsId + '&activityId=' + this.data.activityId,
      })
     
    }
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
                userId: loginres.data.data.userId
              })
              that.onShow()
            
            }else if(loginres.data.errorCode == 5010){
              that.setData({
                showAuthorize: true,
                source: source
              })
            }
          })
        }
      },
      fail: function (res) { }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timer);
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