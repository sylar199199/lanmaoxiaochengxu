const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    adressId: '',
    region: ['广东省', '广州市', '海珠区'],
    city: "广州市",
    contact: "",
    detailAddress: "",
    district: "海珠区",
    province: "广东省",
    tel: "",
    activityId: '',
    goodsId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      activityId: options.activityId,
      goodsId: options.goodsId
    })
    if (options.id) {
      this.setData({
        adressId: options.id
      })
      this.getAdress()
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  useWxadress(){
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success() {
              wx.chooseAddress({
                success(res) {
                  console.log(res)
                  that.setData({
                    contact: res.userName,
                    district: res.countyName,
                    province: res.provinceName,
                    city: res.cityName,
                    detailAddress: res.detailInfo
                  })
                }
              })
            },
            fail(res) {
             //用户拒绝授权后执行
              wx.showModal({
                title: '提示',
                content: '若不授权微信地址，请输入地址信息',
                showCancel: false,
                confirmText: '授权',
                success: (res => {
                  wx.openSetting({
                    success: (res) => { }
                  })
                })
              })
            }
          })
        }
        if (res.authSetting['scope.address']){
          wx.chooseAddress({
            success(res) {
              that.setData({
                contact: res.userName,
                district: res.countyName,
                province: res.provinceName,
                city: res.cityName,
                detailAddress: res.detailInfo,
                tel: res.telNumber
              })
            }
          })
        } 
      },
      fail(res) {
       
      }
    })
  },
  getAdress(){
    util.request('lanmao/mp/user/address/' + this.data.adressId, 'GET', '', '', (reg) => {
      if (reg.data.errorCode == 0) {
        this.setData({
          city: reg.data.data.city,
          contact: reg.data.data.contact,
          detailAddress: reg.data.data.detailAddress,
          district: reg.data.data.district,
          province: reg.data.data.province,
          tel: reg.data.data.tel,
        })
      } else if (reg.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  checkValue(name,type,submit){
    var on = true;
    if (type == 'contact'){
      this.setData({
        contact: name
      })
      if (name.length < 2 || name.length > 20) {
        wx.showToast({
          title: '请输入正确的联系人姓名',
          icon: 'none'
        })
        on = false;
      }
    }
    if (type == 'tel') {
      this.setData({
        tel: name
      })
      if (!(/^1[3456789]\d{9}$/.test(name))) { 
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        on = false;
      }
    }
    if (type == 'detailAddress') {
      this.setData({
        detailAddress: name
      })
      console.log(name)
      if (name.length < 2 || name.lenght > 200) {
        wx.showToast({
          title: '请输入不少于2位，不大于200位的详细地址',
          icon: 'none'
        })
        on = false;
      }
    }
    if(submit){
      return on;
    }
   
  },
  changeValue(e){
    var name = e.detail.value.replace(/\s*/g, "");
    var type = e.currentTarget.dataset.type;
    this.checkValue(name, type, '')
  },
  saveAdress(){
    var province = this.data.province, city = this.data.city, district = this.data.district;
    console.log(province, city, district)
    if (!this.checkValue(this.data.contact, 'contact', '1')){
      return;
    }
    if (!this.checkValue(this.data.tel, 'tel', '1')) {
      return;
    }
    
    if (!province || !city || !district){
      wx.showToast({
        title: '请选择省市区',
        icon: 'none'
      })
      return;
    }
    if (!this.checkValue(this.data.detailAddress, 'detailAddress', '1')) {
      return;
    }
    var data = {
      "city": city,
      "contact": this.data.contact,
      "detailAddress": this.data.detailAddress,
      "district": district,
      "province": province,
      "tel": this.data.tel
    }
    if (this.data.adressId){
      util.request('lanmao/mp/user/address/' + this.data.adressId, 'POST', data, '', (loginres) => {
        if (loginres.data.errorCode == 0) {
          wx.navigateBack({
            url: '/pages/adressList/adressList?goodsId=' + this.data.goodsId + '&activityId=' + this.data.activityId,
          })

        } else if (loginres.data.errorCode == 5001) {
          this.onLogin();
        }
      })
    }else{
      util.request('lanmao/mp/user/address', 'POST', data, '', (loginres) => {
        if (loginres.data.errorCode == 0) {
          wx.navigateBack({
            url: '/pages/adressList/adressList?goodsId=' + this.data.goodsId + '&activityId=' + this.data.activityId
          })

        } else if (loginres.data.errorCode == 5001) {
          this.onLogin();
        }
      })
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
            if (loginres.data.errorCode == 0) {
              wx.setStorageSync('token', loginres.data.data.token)
              wx.setStorageSync('loginInfo', JSON.stringify(loginres.data.data))
              that.saveAdress()
            }
          })
        }
      },
      fail: function (res) { }
    })
  },
  bindRegionChange: function (e) {
    var that = this
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      //拼的字符串传后台
      region: e.detail.value[0] + " " + e.detail.value[1] + " " + e.detail.value[2],
      //下拉框选中的值
      region: e.detail.value
    })
    this.setData({
      province: e.detail.value[0],
      city: e.detail.value[1],
      district: e.detail.value[2],
    })
    console.log(this.data.AddSite)
  },
})