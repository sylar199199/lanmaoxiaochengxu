const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showorder: true,
    hasAdress: false,
    gouqiCount: null,
    price: 0,
    stock: 0,
    specsName: null,
    specsId: '',
    imgUrl: null,
    name: null,
    quantity: 1,
    selectAdress: null,
    activityId: '',
    goodsId: '',
    tel: null,
    remarkValue: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      activityId: options.activityId,
      goodsId: options.goodsId
    })
   
   


  },
  goAdress() {
    wx.navigateTo({
      url: '/pages/adressList/adressList?goodsId=' + this.data.goodsId + '&activityId=' + this.data.activityId,
    })
  },
 
  onShow: function() {
    if (wx.getStorageSync('adressId')){
      this.setData({
        adressId: wx.getStorageSync('adressId')
      })
    }
    let pages = getCurrentPages(); // 获取当前页面栈
    let prevPage = pages[pages.length - 2]; // -2 就是你上一页的数据 你上上页的数据就是-3 了以此类推！
    console.log(prevPage)
    // 直接操作上一个页面的 index数据 之后返回 
    // prevPage.setData({
    //   index: index
    // }, function () {
    //   wx.navigateBack()
    // })
    this.getDetail();
    if (this.data.adressId) {
      this.getAdress()
    } else {
      this.getdefaultAdress()
    }
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
  getDetail() {
    util.request('lanmao/redeem/activity/goods?activityId=' + this.data.activityId + '&goodsId=' + this.data.goodsId, 'GET', '', '', (loginres) => {
      if (loginres.data.errorCode == 0) {
        this.setData({
          imgUrl: loginres.data.data.goods.imgUrl,
          name: loginres.data.data.goods.name
        })
        console.log(wx.getStorageSync('selectGoodsProduct' + this.data.activityId + this.data.goodsId))
        if (wx.getStorageSync('selectGoodsProduct' + this.data.activityId + this.data.goodsId)) {
          this.resetData();
        } else {
          var num = 0;
          for (let i in loginres.data.data.goods.specs) {
            if (loginres.data.data.goods.specs[i].stock != 0) {
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
          if (num == loginres.data.data.goods.specs.length) {
            this.setData({
              gouqiCount: loginres.data.data.goods.specs[0].points,
              price: loginres.data.data.goods.specs[0].price,
              stock: loginres.data.data.goods.specs[0].stock,
              specsName: loginres.data.data.goods.specs[0].name,
              specsId: loginres.data.data.goods.specs[i].id
            })
          }
        }
      } else if (loginres.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  getAdress() {
    util.request('lanmao/mp/user/address/' + this.data.adressId, 'GET', '', '', (reg) => {
      if (reg.data.errorCode == 0) {
        wx.removeStorageSync('adressId');
        console.log(reg.data.data)
        if (reg.data.data) {
          this.setData({
            selectAdress: reg.data.data,
            tel: this.geTel(reg.data.data.tel),
            hasAdress: true
          })
        } else {
          this.setData({
            hasAdress: true
          })
        }
      } else if (reg.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  getdefaultAdress() {
    util.request('lanmao/mp/user/address/default', 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        if (res.data.data){
          this.setData({
            selectAdress: res.data.data,
            tel: this.geTel(res.data.data.tel),
            hasAdress: true
          })
        }else{
          this.setData({
            hasAdress: true
          })
        }
      } else if (res.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  geTel(tel) {
    console.log(tel)
    var reg = /^(\d{3})\d{4}(\d{4})$/;
    return tel.replace(reg, "$1****$2");
  },
  creadOrder(){
    var selecspecsIdroduct = wx.getStorageSync('selectGoodsProduct' + this.data.activityId + this.data.goodsId)
    console.log(selecspecsIdroduct)
    if (!(selecspecsIdroduct.specsId)){
        wx.showToast({
          title: '请选择规格',
          icon: 'none'
        })
        return
    }
    if (!this.data.selectAdress){
      wx.showToast({
        title: '请选择收获地址',
        icon: 'none'
      })
      return
    }

    var data = {
      "activityId": this.data.activityId,
      remark: this.data.remarkValue,
      "consignee": {
        "address": this.data.selectAdress.detailAddress,
        "city": this.data.selectAdress.city,
        "district": this.data.selectAdress.district,
        "name": this.data.selectAdress.contact,
        "phone": this.data.selectAdress.tel,
        "province": this.data.selectAdress.province,
      },
      "specId": selecspecsIdroduct.specsId
    }
    this.setData({
      showorder: false
    })
    util.request('lanmao/order', 'POST', data, '', (res) => {
      
      if (res.data.errorCode == 0) {
        this.payOrder(res.data.data.id)
      } else if (res.data.errorCode == 5001) {
        this.onLogin();
        this.setData({
          showorder: true
        })
      }else{
        this.setData({
          showorder: true
        })
      }
    })
  },
  payOrder(id){
    util.request('lanmao/order/' + id + '/pay', 'POST', '', '', (payres) => {
      this.setData({
        showorder: true
      })
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
            wx.removeStorageSync('selectGoodsProduct' + this.data.activityId + this.data.goodsId)
          },
          fail(res) { }
        })

      } else if (payres.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  bindKeyInput: function (e) {
   console.log(e.detail.value.length)
    if(e.detail.value.length>200){
      wx.showToast({
        title: '请输入不超过200字的备注',
        icon: 'none'
      })
    }else{
      this.setData({
        remarkValue: e.detail.value
      })
    }
   
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