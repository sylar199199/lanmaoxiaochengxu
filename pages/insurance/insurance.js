// pages/insurance/insurance.js
const util = require('../../utils/util.js');
var a;
Page({
  data: {
    backinsurance: 'https://oss.ifxj.com/lanmao/health/backinsurance.png?'+Date.parse(new Date()),
    insuranceInfo: 'https://oss.ifxj.com/lanmao/health/insuranceInfo.png?'+Date.parse(new Date()),
    insurancetext: 'https://oss.ifxj.com/lanmao/health/insurancetext.png?'+Date.parse(new Date()),
    insurancetext1: 'https://oss.ifxj.com/lanmao/health/insurancetext1.png?'+Date.parse(new Date()),
    insurancetitle: 'https://oss.ifxj.com/lanmao/health/insurancetitle.png?'+Date.parse(new Date()),
    insuranclogo: 'https://oss.ifxj.com/lanmao/health/insuranclogo.png?'+Date.parse(new Date()),
    insurancehc: 'https://oss.ifxj.com/lanmao/health/insurancehc.png?'+Date.parse(new Date()),
    insurancePhonto: 'https://oss.ifxj.com/lanmao/health/insurancePhonto.png?'+Date.parse(new Date()),
    insuranceNoselect: 'https://oss.ifxj.com/lanmao/health/insuranceNoselect.png?'+Date.parse(new Date()),
    insuranceselect: 'https://oss.ifxj.com/lanmao/health/insuranceselect.png?'+Date.parse(new Date()),
    klcode:'https://oss.ifxj.com/lanmao/health/klcode.jpg?'+Date.parse(new Date()),
    navTop: null,
    isSelect: false,
    showtk: false,
    id: '',
    phone: '',
    name: '',
    idNum: '',
    showLight: true,
  },
  onShow(){
    if (a) {
      a = false;
      return;
    }
    var device = wx.getSystemInfoSync();
      this.setData({
        top: (device.windowHeight - 320) / 2,
      })
    this.setData({
      navTop:  wx.getStorageSync('navTop')
    })
    if(wx.getStorageSync('phone')){
      this.setData({
        phone: wx.getStorageSync('phone')
      })
    }
   this.lastinsurance()
  },
  gogzh(){
    wx.navigateTo({
      url: '/pages/ceyice/ceyice',
    })
  },
  getbirthday(idNumber,type,guaranteeTime){
    var sex,birthday;
        //获取性别 
        if (parseInt(idNumber.substr(16, 1)) % 2 == 1) {
            //是男则执行代码 ..
            sex = 1;
            //是女则执行代码 .. 
        } else {
            sex = 2;
        }
        //获取年龄 
        var myDate;
        if(guaranteeTime){
            myDate = new Date(guaranteeTime)
        }else{
            myDate = new Date();
        }
        // console.log(new Date(guaranteeTime),myDate)
        var month = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var age = myDate.getFullYear() - idNumber.substring(6, 10) - 1;
        if (idNumber.substring(10, 12) < month || idNumber.substring(10, 12) == month && idNumber.substring(12, 14) <= day) {
            age++;
        }
        //判断出生日期
        if(idNumber.length==15){
            var year = "19"+idNumber.substring(6,8)+"-"+idNumber.substring(8,10)+"-"+
                idNumber.substring(10,12);
            if(age == 0){
                var date1 = new Date();
                var date2 = new Date(year);
                var date = Math.ceil((date1.getTime() - date2.getTime()) / (24 * 60 * 60 * 1000));
                // age = date+'天';
                age = 0;
            }
        }
        if(idNumber.length==18){
            var year = idNumber.substring(6,10)+"-"+idNumber.substring(10,12)+"-"+
                idNumber.substring(12,14);
            if(age == 0){
                var date1 = new Date();
                var date2 = new Date(year);
                var date = Math.ceil((date1.getTime() - date2.getTime()) / (24 * 60 * 60 * 1000));
                // age = date+'天';
                age = 0;
            }
        }
        birthday = year;
        if(type == 'birthday'){
            return birthday
        }
        if(type == 'age'){
            if((age.toString()).indexOf('天')<0){
                age = age
            }
            return age;
        }
        if(type == 'sex'){
            return sex;
        }
    },
    usernameInput(e,type){
      var on = true;
      console.log(e)
      if(e){
        var name = e.detail.value.replace(/\s+/g, "");
        this.setData({
          name: name
        })
      }else{
        var name  = this.data.name;
      }
      var regname = /^[\u4e00-\u9fa5]+$/;
      if(!name){
        wx.showToast({
          title: '姓名不能为空',
          icon: 'none'
        })
        on = false;
      }else{
        if(name.length < 2 || name.length > 20){
          wx.showToast({
            title: '姓名不少于2个字或不多于20字',
            icon: 'none'
          })
          on = false;
          return
        }
        // if(!regname.test(name)){
        //   wx.showToast({
        //     title: '姓名格式不正确',
        //     icon: 'none'
        //   })
        //   on = false;
        //   return
        // }
      }
      if(type){
        return on
      }
    },
  useridNumInput(e,type){
    var on = true;
    if(e){
      var idNum = e.detail.value.replace(/\s+/g, "");
      this.setData({
        idNum: idNum
      })
    }else{
      var idNum  = this.data.idNum;
    }
    var regidNum = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
    if(!idNum){
      wx.showToast({
        title: '身份证号不能为空',
        icon: 'none'
      })
      on = false;
    }else{
      if(!regidNum.test(idNum)){
        wx.showToast({
          title: '身份证格式不正确',
          icon: 'none'
        })
        on = false;
        return
      }
     
    }
    if(type){
      return on
    }
  },
  submit(){
    var name = this.data.name;
    var idNum = this.data.idNum;
    console.log(idNum)
    var getAge = this.getbirthday(idNum,'age');
    console.log(getAge)
    if(!name){
      wx.showToast({
        title: '姓名不能为空',
        icon: 'none'
      })
      return;
    }else{
      if(!this.usernameInput('','submit')){
          return;
      }
    }
    if(!idNum){
      wx.showToast({
        title: '身份证不能为空',
        icon: 'none'
      })
      return;
    }else{
      if(!this.useridNumInput('','submit')){
          return;
      }
    }
    if(getAge < 18 || getAge >= 60){
      wx.showToast({
        title: '赠险领取年龄为18岁-60周岁',
        icon: 'none'
      })
      return;
    }
    var that = this;
    var data = {
      activityId: this.data.id,
      email: '',
      idNumber: idNum,
      name: name,
      phone: this.data.phone
    }
    util.request('lanmao/gift/insurance/order', 'POST', data, '', (res) => {
        if (res.data.errorCode == 0) {
          that.setData({
            showtk: true
          })
         
        } else if (res.data.errorCode == 5001) {
          this.onLogin('lastinsurance');
        }
    })
    
    
  },
  lastinsurance(){
    var that = this;
    util.request('lanmao/gift/insurance/activity/latest', 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        if(res.data.data){
          this.setData({
            id: res.data.data.id
          })
          var limitNumber = res.data.data.limitNumber;
          var userCount = res.data.data.userCount;
          if(res.data.data.participated){
            wx.showToast({
              title: "此活动您已经参与",
              icon: 'none'
            })
            that.setData({
              showLight: false
            })
            setTimeout(function(){
              wx.navigateBack({
                delta: 1
                })
            },3000)
            return
          }
          console.log(limitNumber,userCount)
          if(limitNumber != 0 && limitNumber == userCount){
            wx.showToast({
              title: '活动人数已达上限',
              icon: 'none'
            })
            that.setData({
              showLight: false
            })
            setTimeout(function(){
              wx.navigateBack({
                delta: 1
                })
            },3000)
            return
          }
          that.setData({
            showLight: true
          })
        }else{
          wx.showToast({
            title: '暂无活动',
            icon: 'none'
          })
          that.setData({
            showLight: false
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
              })
          },3000)
        }
         
      } else if (res.data.errorCode == 5001) {
        this.onLogin('lastinsurance');
      }
    })
  },
  _navBack: function () {
    wx.switchTab({
      url: '/pages/home/home'
    })
  },
  //登录
  onLogin(source) {
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
             
            } else if (loginres.data.errorCode == 0) {
              wx.setStorageSync('token', loginres.data.data.token)
              wx.setStorageSync('loginInfo', JSON.stringify(loginres.data.data))
              that.setData({
                userId: loginres.data.data.id,
                navBarName: loginres.data.data.nickname
              })
              
              if(source == 'playcomplete'){
                that.playcomplete()
              }else if(source == 'lastinsurance'){
                that.lastinsurance()
              }
            }
          })
        }
      },
      fail: function(res) {}
    })
  },
  changeSelect(){
    this.setData({
      isSelect: !this.data.isSelect
    })
  },
  closetk(){
    this.setData({
      showtk: false
    })
    setTimeout(function(){
      wx.navigateBack({
        delta: 1
        })
    },2000)
  },
  // 预览客服二维码
  previewImage(e){
    a = true
    var current = e.target.dataset.src;   //这里获取到的是一张本地的图片
    wx.previewImage({
      current: current,//需要预览的图片链接列表
      urls: [current]  //当前显示图片的链接
    })
  },
  takePhoto(){
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        console.log(tempFilePaths)
        that.getocrData(tempFilePaths)
      }
    })
  },
  getocrData(tempFilePaths){
    var token = wx.getStorageSync('token');
    wx.showLoading({
      icon: 'none',
      mask: true
    })
    var that = this;
    wx.uploadFile
      ({
        url: util.httpUrl + 'lanmao/gift/insurance/ocr/idcard',
        filePath: tempFilePaths,
        name: 'file',
        header: {
          'token': token
        },
        formData: {},
        success(res) {
          console.log(res)
          if(res.statusCode == '200'){
            var data = JSON.parse(res.data);
            console.log(data.data)
            that.setData({
              name: data.data.name,
              idNum: data.data.id,
            })
          }
          wx.hideLoading();
        }
      })
  }
})
