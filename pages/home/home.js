//获取应用实例
//index.js
var that = undefined;
var doommList = [];
var i = 0;
var ids = 0; 
// 在页面中定义激励视频广告
let videoAd = null;
var on  = false;
// 弹幕参数
class Doomm {
  constructor(text, text1, text2,top, time, color) { //内容，顶部距离，运行时间，颜色（参数可自定义增加）
    this.userName = text;
    this.goodsName = text1;
    this.type = text2;
    this.top = top;
    this.time = time;
    this.color = color;
    this.display = true;
    this.id = i++;
  }
}
// 弹幕字体颜色
function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}
const util = require('../../utils/util.js');
const App = getApp();

Page({
  data: {
    showAuthorizephone: false,
    code: '',
    hasLogin: false,
    hasData: false,
    quantity: null,
    source: null,
    marginTop: wx.getStorageSync('navHeight'),
    infotop: null,
    codeTop: null,
    showCode: false,
    showYindao: false,
    hastime: false,
    isShow: false,
    percentone: '',
    warmText: '',
    percent: '',
    showpercentone: true,
    showpercenttwo: false,
    showpercentthree: false,
    count: 0,
    hasdanchu: [],
    danmmuTop: 30,
    timeout: null,
    cycle: null,
    getNewtime: null,
    danmuLength: 0,
    adultImgUrl: '',
    adultPoints: '',
    newDanmu: [],
    latestOrderId: '',
    latestMedalId: '',
    doommData: [],
    firstdanmu: [],
    bacImg: '',
    ipimg: '',
    pointsItems: [],
    inviteUserId: '',
    returnday: '00',
    minute: "00",
    hour: '00',
    second: '00',
    navBarName: '',
    navHeight: 0,
    countNumber: '',
    totalPoints: '',
    showAuthorize: false,
    userInfo: {},
    userId: '',
    timeItem: [],
    timer: null,
    hasUserInfo: false,
    loginInfo: null,
    showItems: [],
    onePoints: [],
    twoPoints: [], 
    threePoints: [],
    fourPoints:[],
    itemtimer: null,
    isDisabled: false,
    todayLikeCount: 0,
    todayPostCount: 0,
    tuiguang: 'https://oss.ifxj.com/lanmao/health/tuiguang.png?'+Date.parse(new Date()),
    tongzhi: 'https://oss.ifxj.com/lanmao/health/tongzhi.png?'+Date.parse(new Date()),
    dakaimgUrl: 'https://oss.ifxj.com/lanmao/health/daka.jpg?'+Date.parse(new Date()),
    yaoqing: 'https://oss.ifxj.com/lanmao/health/yaoqing03271.png?'+Date.parse(new Date()),
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    marqueeDistance2: 0,
    marquee2copy_status: false,
    marquee2_margin: 60,
    size: 13,
    orientation: 'left',//滚动方向
    interval: 20 // 时间间隔
  },
  onShow() {
    this.toast = this.selectComponent("#toast");
    var that = this;
    if (typeof that.getTabBar === 'function' && that.getTabBar()) {
      that.getTabBar().setData({
        selected: 1
      })
    }
    if (typeof that.getTabBar === 'function' && that.getTabBar()) {
      that.getTabBar().setData({
        selected: 0
      })
    }
    var device = wx.getSystemInfoSync();
    that.setData({
      infotop: (device.windowHeight - 420) / 2,
      codeTop: (device.windowHeight - 450) / 2,
      marginTop: wx.getStorageSync('navHeight')
    })
    that.setData({
      navHeight: App.globalData.navHeight,
    })
    that.getnologinInfo()
    that.getHomeInfo('');
   var gettimer = setInterval(function() {
      that.getDanmu()
    }, 5 * 60 * 1000)
    that.setData({
      gettimer: gettimer
    })
  },
  
  onLoad: function(options) {
    // this.loadVideo()
    if(options.scene){
      const scene = decodeURIComponent(options.scene);
      var index = scene.indexOf('=')+1;
      var index1 = scene.indexOf('&');
      var lastIndex = scene.lastIndexOf('=')+1;
      this.setData({
        inviteUserId: scene.substring(index,index1),
        inviteType: scene.substring(lastIndex),
      })
      var inviteUserId = scene.substring(index,index1);
      var inviteType = scene.substring(lastIndex);
      wx.setStorageSync('inviteUserId',inviteUserId)
      wx.setStorageSync('inviteType',inviteType)
    }
    if (options.inviteUserId) {
      this.setData({
        inviteUserId: options.inviteUserId
      })
      wx.setStorageSync('inviteUserId',options.inviteUserId)
    }
    if (options.inviteType) {
      this.setData({
        inviteType: options.inviteType
      })
      wx.setStorageSync('inviteType',options.inviteType)
    }
    // this.createVideoAd()
    if (App.globalData.userInfo) {
      this.setData({
        userInfo: App.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      App.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      // wx.getUserInfo({
      //   success: res => {
      //     App.globalData.userInfo = res.userInfo
      //     this.setData({
      //       userInfo: res.userInfo,
      //       hasUserInfo: true
      //     })
      //   }
      // })
    }
  
  },
  //视频错误信息提示
  videoAdErrHandle(err){
      console.log('视频加载失败')
      console.log(err)
      // {errMsg: "no advertisement", errCode: 1004}
      const errHandle={
          1000:'后端接口调用失败',
          1001:'参数错误',
          1002:'广告单元无效',
          1003:'内部错误',
          1004:'无合适的广告',
          1005:'广告组件审核中',
          1006:'广告组件被驳回',
          1007:'广告组件被封禁',
          1008:'广告单元已关闭',
      }
      // return errHandle[err.errCode] || '视频加载错误,重新加载页面试试吧'
      return errHandle[err.errCode]
  },
  // 创建视频
  createVideoAd(){
    var that = this;
    wx.getSystemInfo({
      success (res) {
        console.log(res.SDKVersion)
        var version = res.SDKVersion;
        version = version.replace(/\./g, "")
        if(parseInt(version)<260){
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          })
          return
        }
      }
    })
    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-fb7c4a3c0d847fa4'
      })
     
      videoAd.onLoad(() => {})
      videoAd.onError((err) => {
        videoAd = null;
        wx.showToast({
          title: this.videoAdErrHandle(err),
          icon: 'none'
      })
      })
      videoAd.onClose((res) => {
        if(!videoAd) return
          videoAd.offClose()
       
        if (res && res.isEnded || res === undefined) {
          that.playcomplete()
        } else {
          // wx.showToast({title: '未完整观看视频不能获取奖励哦', icon: 'none'})
        }
      })
     
    }

  },
 /**
   * @method loadVideo 加载视频并播放
   */
  loadVideo(){
    wx.showLoading({
      title: '',
      mask: true
    })
      this.createVideoAd()
    // 用户触发广告后，显示激励视频广告
    if (videoAd) {
      setTimeout(function(){
        wx.hideLoading()
      },1000)
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            wx.showToast({
              title: this.videoAdErrHandle(err),
              icon: 'none'
            })
            console.log(err)
          })
      })
    }
  },
 
  //视频播放完
  playcomplete(){
    util.request('lanmao/mp/home/videoad/play/complete', 'post', {}, '', (loginres) => {
      wx.hideLoading()
      if (loginres.data.errorCode == 0) {
        this.getnologinInfo()
        this.getGouqi()
      } else if (loginres.data.errorCode == 5001) {
        this.onLogin('playcomplete');
      }
    })
  },
   run1: function () {
    var vm = this;
    var interval = setInterval(function () {
      if (-vm.data.marqueeDistance < vm.data.length) {
        vm.setData({
          marqueeDistance: vm.data.marqueeDistance - vm.data.marqueePace,
        });
      } else {
        clearInterval(interval);
        vm.setData({
          marqueeDistance: vm.data.windowWidth
        });
        vm.run1();
      }
    }, vm.data.interval);
    this.setData({
      intervalsroll: interval
    })
  },
  run2: function () {
    var vm = this;
    var interval = setInterval(function () {
      if (-vm.data.marqueeDistance2 < vm.data.length) {
        // 如果文字滚动到出现marquee2_margin=30px的白边，就接着显示
        vm.setData({
          marqueeDistance2: vm.data.marqueeDistance2 - vm.data.marqueePace,
          marquee2copy_status: vm.data.length + vm.data.marqueeDistance2 <= vm.data.windowWidth + vm.data.marquee2_margin,
        });
      } else {
        if (-vm.data.marqueeDistance2 >= vm.data.marquee2_margin) { // 当第二条文字滚动到最左边时
          vm.setData({
            marqueeDistance2: vm.data.marquee2_margin // 直接重新滚动
          });
          clearInterval(interval);
          vm.run2();
        } else {
          clearInterval(interval);
          vm.setData({
            marqueeDistance2: -vm.data.windowWidth
          });
          vm.run2();
        }
      }
    }, vm.data.interval);
  },
  getnotice(){
    util.request('lanmao/protocol/5', 'GET', '', '', (loginres) => {
      wx.hideLoading()
      if (loginres.data.errorCode == 0) {
        if( loginres.data.data){
          this.setData({
            noticecontent: loginres.data.data.content
          })
          var vm = this;
          var length = vm.data.noticecontent.length * vm.data.size;//文字长度
          var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
          vm.setData({
            length: length,
            windowWidth: windowWidth,
            marquee2_margin: length < windowWidth ? windowWidth - length : vm.data.marquee2_margin//当文字长度小于屏幕长度时，需要增加补白
          });
          vm.run1();// 水平一行字滚动完了再按照原来的方向滚动
          // vm.run2();// 第一个字消失后立即从右边出现
        }
        
      } else if (loginres.data.errorCode == 5001) {
        this.onLogin('getnotice');
      }
    })
  },

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
    if(type == 'day'){
      return new Date(east9time).getDate()
    }else if(type == 'hours'){
      return new Date(east9time).getHours()
    } else if (type == 'minutes') {
      return new Date(east9time).getSeconds()
    } else if (type == 'secondes') {
      return new Date(east9time).getSeconds()
    }else if(type == 'times'){
      return east9time
    }
  },
  goactivitylist(){
    wx.switchTab({
      url: '/pages/activitylist/activitylist'
    });  
  }, 
  openCode() {
    this.setData({
      showCode: true
    })
  },
  closeCode() {
    this.setData({
      showCode: false
    })
  },
  // 预览客服二维码
  previewImage(e){
    var current = e.target.dataset.src;   //这里获取到的是一张本地的图片
    wx.previewImage({
      current: current,//需要预览的图片链接列表
      urls: [current]  //当前显示图片的链接
    })
  },
  zhuan8(time){
    var timezone = 8; //目标时区时间，东八区
    var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
    var nowDate = new Date(time).getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
    var targetDate = new Date(nowDate + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000);
    return targetDate
  },
  // //判断开始时间在哪个时间段
  judgeTime(time){
   var targetDate = this.zhuan8(time)
    var currentday8 = this.changeCount('day')
    var str = '';
    console.log(targetDate.getHours())
    if (targetDate.getHours() == 6){//0-12之间
      if (currentday8 != targetDate.getDate()){
        str = 'four';
      }else{
        str = 'one';
      }
    } else if ((currentday8 == targetDate.getDate()) && (targetDate.getHours() == 12)){//更新12-18点之间的状态
      str = 'two';
    } else if ((currentday8 == targetDate.getDate()) && (targetDate.getHours() == 18)){//18-24之间
      str = 'three';
    }
    return str;
  }, 
  judgecurrentTime(){
    var str = '';
    var Hours = this.changeCount('hours');
    if (Hours >= 0 && Hours<12) {//0-12之间
      str = 'first';
    } else if (Hours >= 12 && Hours < 18) {//更新12-18点之间的状态
      str = 'second';
    } else if (Hours <= 23 && Hours>= 18) {
      str = 'third';
    }
    return str;
  },
  // // //判断当前时间在哪个时间段
  setTimeer() {
    var getHours = this.changeCount('hours'), getMinutes = this.changeCount('minutes'), getSeconds = this.changeCount('seconds');
    if ((getHours == 0) && (getMinutes == 0) && (getSeconds == 0)) {//0-12之间
       this.getHomeInfo('1')
    } else if (getHours == 12 && getMinutes == 0 && getSeconds == 0) {//更新12-18点之间的状态
      this.getHomeInfo('1')
    } else if (getHours === 18 && getMinutes == 0 && getSeconds == 0) {
      this.getHomeInfo('1')
    }
  }, 
  collectResetData(index){
    var onePoints = this.data.onePoints, twoPoints = this.data.twoPoints, threePoints = this.data.threePoints, fourPoints = this.data.fourPoints, pointsItemsArr = this.data.showItems;
    var currentStatuis = this.judgecurrentTime();//当前时间段
    console.log(currentStatuis)
    if (currentStatuis == 'first') {
      for (var i in twoPoints) {
        if (!(pointsItemsArr.some(({ id }) => id == twoPoints[i].id))) {
          twoPoints[i].size = pointsItemsArr[index].size;
          twoPoints[i].overTime = true;
          pointsItemsArr[index] = twoPoints[i];
          break;
        }
      }
    }
    if (currentStatuis == 'second') {
      for (var i in threePoints) {
        if (!(pointsItemsArr.some(({ id }) => id == threePoints[i].id))) {
          threePoints[i].size = pointsItemsArr[index].size;
          threePoints[i].overTime = true;
          pointsItemsArr[index] = threePoints[i];
          break;
        }
      }
    }
    if (currentStatuis == 'third') {
      for (var i in fourPoints) {
        if (!(pointsItemsArr.some(({ id }) => id == fourPoints[i].id))) {
          fourPoints[i].size = pointsItemsArr[index].size;
          fourPoints[i].overTime = true;
          pointsItemsArr[index] = fourPoints[i];
          break;
        }
      }
    }
    console.log(pointsItemsArr)
    this.setData({
     showItems: pointsItemsArr
    })
  },
  resetData(pointsItems,index){//对待收集的物品重置（具体时间点，收集水之后需要设置）
    // showItems
    var offestobj = {
      right: '',
      top: ''
    }
    var currentStatuis = this.judgecurrentTime();//当前时间段
    var currentTime = new Date().getTime(), pointsItemsArr = [], onePoints = [],twoPoints = [],threePoints = [],fourPoints = [];
    for (var i in pointsItems){
      pointsItems[i].overTime = false;
      //获取每个时间端展示的数据
      if (this.judgeTime(pointsItems[i].startTime) == 'one') {
          var obj = pointsItems[i];
          onePoints.push(obj)
      }else  if (this.judgeTime(pointsItems[i].startTime) == 'two') {
        var obj = pointsItems[i];
        twoPoints.push(obj)
      } else if (this.judgeTime(pointsItems[i].startTime) == 'three') {
        var obj = pointsItems[i];
        threePoints.push(obj)
      } else if (this.judgeTime(pointsItems[i].startTime) == 'four') {
        var obj = pointsItems[i];
        fourPoints.push(obj)
      }
    }
    console.log(this.judgeTime(pointsItems[i].startTime))
    this.setData({
      onePoints: onePoints,
      twoPoints: twoPoints,
      threePoints: threePoints,
      fourPoints: fourPoints
    })
    if (currentStatuis == 'first'){
      for (let i in onePoints){
        if (onePoints[i].status == 0){
          var obj = onePoints[i];
          pointsItemsArr.push(obj)
        }
      }
      for (let i in twoPoints) {
        if (pointsItemsArr.length < onePoints.length){
          var obj = twoPoints[i];
          twoPoints[i].overTime = true
          pointsItemsArr.push(obj)
        }
      }
    }
    if (currentStatuis == 'second') {
      for (let i in twoPoints) {
        if (twoPoints[i].status == 0) {
          var obj = twoPoints[i];
          pointsItemsArr.push(obj)
        }
      }
      for (let i in threePoints) {
        if (pointsItemsArr.length < twoPoints.length) {
          var obj = threePoints[i];
          threePoints[i].overTime = true;
          pointsItemsArr.push(obj)
        }
      }
    }
    if (currentStatuis == 'third') {
      for (let i in threePoints) {
        if (threePoints[i].status == 0) {
          var obj = threePoints[i];
          pointsItemsArr.push(obj)
        }
      }
      for (let i in fourPoints) {
        if (pointsItemsArr.length < threePoints.length) {
          var obj = fourPoints[i];
          fourPoints[i].overTime = true;
          pointsItemsArr.push(obj)
        }
      }
    }
    var ilength = pointsItemsArr.length;
    if (ilength<5){
      var perangle = 180 / ilength;
    } else{
      var perangle = 230 / ilength;
    }
    
    for (let i in pointsItemsArr) {
      obj = {
        top: 250 - 250 * Math.sin((perangle * i) * Math.PI / 180) - perangle,
        right: 250 - 250 * Math.cos((perangle * i) * Math.PI / 180) - perangle,
      }
      pointsItemsArr[i].size = obj;
    }
    this.setData({
      showItems: pointsItemsArr
    })
   
  },
  // 分享配置
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
      title: nickName+"给你发了一个积分红包,点击领取,超低价兑换盲盒",
      path: pathstr,
      imageUrl: 'https://oss.ifxj.com/lanmao/health/zhuanfa1.jpg?'+Date.parse(new Date())
    }
  },
    
  previewImage(e){
    var current = e.target.dataset.src;   //这里获取到的是一张本地的图片
    wx.previewImage({
      current: current,//需要预览的图片链接列表
      urls: [current]  //当前显示图片的链接
    })
  },
 
  // getinvite(){
  //   util.request('lanmao/mp/home/invite/count', 'GET', '', '', (res) => {
  //     if (res.data.errorCode == 0) {
  //       this.setData({
  //         count: res.data.data,
  //       })
  //     } else if (res.data.errorCode == 5001) {
  //       this.onLogin();
  //     }
  //   })
  // },
  //监听手机号授权组件传来的消息
  phonevent(e){
    if(!e.detail.showAuthorizephone){
      this.setData({
        showAuthorizephone: false
      })
    }
  },
  getUser(type) {
    var that = this;
    util.request('lanmao/mp/user/user/info', 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        wx.setStorageSync('userId', res.data.data.id)
        this.setData({
          userId: res.data.data.id,
          navBarName: res.data.data.nickname,
          loginInfo: res.data.data
        })
        wx.setNavigationBarTitle({
          title: this.data.navBarName
        })
       
        if(!res.data.data.phone){
          if(type == 'showphone'){
            that.setData({
              showAuthorizephone: true
            })
          }
        }else{
          wx.setStorageSync('phone', res.data.data.phone)
        }
      } else if (res.data.errorCode == 5001) {
        that.onLogin();
      }
    })
  },
 
  getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0),
    
      i = arr.length,
      min = i - count,
      temp, index;
    while (i-- > min) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    this.setData({
      danmuLength: shuffled.slice(min).length
    })
    var hasdanchu = this.data.hasdanchu.concat(shuffled.slice(min));
    if (hasdanchu.length >= this.data.firstdanmu.length){
      hasdanchu = [];
    }
    this.setData({
      hasdanchu: hasdanchu
    })
    this.opendanmu(shuffled.slice(min));
  },
  clearTime(time){
    var that = this;
    clearInterval(timeout)
     var timeout = setTimeout(function () {
      clearTimeout(that.data.timeout)
      clearInterval(that.data.cycle)
      that.setData({
        danmmuTop: 30
      })
      var num = Math.floor(Math.random() * 4)+1;
      var newDanmu = that.data.newDanmu;
      that.setData({
        firstdanmu: that.data.firstdanmu.concat(newDanmu),
        newDanmu: []
      })
      // 去重 
       var quchongdata = that.data.firstdanmu.filter((item) => !that.isOther(item.id, that.data.hasdanchu));
       that.getRandomArrayElements(quchongdata, num)
    }, time);
    that.setData({
      timeout: timeout
    })
  },
  isOther(x, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (x === arr[i].id) {
        return true;
      }
    }

    return false;
  },
  opendanmu(danmudata) {
    that = this;
    that.setData({
      doommData: []
    })
    var danmuLength = that.data.danmuLength;
    // var time = parseFloat(7 * danmuLength*1000+7000);
    var time = parseFloat(18000);
    var cycle = setInterval(function () {
      if (danmudata[ids] == undefined) {
        ids = 0;
        clearInterval(that.data.cycle)
        that.clearTime(time);
        doommList = []
      } else {
        doommList.push(new Doomm(danmudata[ids].userName, danmudata[ids].goodsName,danmudata[ids].type, that.data.danmmuTop, 7, getRandomColor()));
        that.setData({
          doommData: doommList
        })
        ids++;
        var danmmuTop = that.data.danmmuTop + 80;
        that.setData({
          danmmuTop: danmmuTop
        })
        if (ids == 3) {
          that.setData({
            danmmuTop: 30
          })
        }
      }
    }, 1000);
    that.setData({
      cycle: cycle
    })
  },
  getDanmu() {
    wx.hideLoading();
    util.request('lanmao/mp/home/barrage?latestOrderId=' + this.data.latestOrderId+'&latestMedalId='+this.data.latestMedalId, 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        var length = res.data.data.length;
        var arr = res.data.data;
        if (arr.length > 0){
          for (let i in arr) {
            if (arr[i].goodsName.length > 20) {
              arr[i].goodsName = arr[i].goodsName.substring(0, 20) + '...'
            }
          }
        }
        if (!this.data.latestOrderId) {
          var num = Math.floor(Math.random() * 4) + 1;
          this.setData({
            firstdanmu: arr
          })
          if(arr.length > 0){
            this.getRandomArrayElements(arr, num)
          }
        } else {
          this.setData({
            newDanmu: arr
          })
          if (arr.length != 0) {
            clearTimeout(this.data.timeout)
            clearTimeout(this.data.getNewtime)
            clearInterval(this.data.cycle)
            ids = 0;
            this.setData({
              danmmuTop: 30
            })
            var that = this;
            // var time = parseFloat(7 * that.data.danmuLength * 1000 + 7000)
            var time = parseFloat(18000)
            var getNewtime = setTimeout(function(){
              clearTimeout(that.data.timeout)
              that.opendanmu(arr)
            }, time);
            that.setData({
              getNewtime: getNewtime
            })
          }
        }
        if (length != 0) {
          var arr1 = [];
          var arr2 = [];
          for(let i in arr){
            if(arr[i].type == 1){
              arr1.push(arr[i]);
            }
            if(arr[i].type == 2){
              arr2.push(arr[i])
            }
          }
          this.setData({
            latestOrderId: arr1[0].id
          })
          if(arr2.length == 0){
            this.setData({
              latestMedalId: ''
            })
          }else{
            this.setData({
              latestMedalId: arr2[0].id
            })
          }
        }
      } else if (res.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
 
  onHide() {
    if(videoAd){
      // videoAd.offClose();
    }
    clearInterval(this.data.intervalsroll);
    clearInterval(this.data.cycle);
    clearInterval(this.data.gettimer);
    clearTimeout(this.data.getNewtime)
    clearTimeout(this.data.timeout)
    clearInterval(this.data.itemtimer)
    ids = 0;
    doommList = [],
    this.setData({
      doommData: doommList,
      latestOrderId: '',
      danmmuTop: 30
    })
  },
  onUnload() {
    // videoAd.offClose();
    // videoAd.destroy()
    clearInterval(this.data.intervalsroll);
    clearInterval(this.data.gettimer);
    clearInterval(this.data.cycle)
    clearTimeout(this.data.getNewtime)
    clearTimeout(this.data.timeout)
    clearInterval(this.data.itemtimer)
    ids = 0;
    doommList = [];
    this.setData({
      doommData: doommList,
      latestOrderId: '',
      latestMedalId: '',
      danmmuTop: 30
    })
  },
  getGouqi() {
    util.request('lanmao/mp/home/points', 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        var totalPoints = res.data.data.totalPoints;
        var totalPointsnum = '';
        if (totalPoints >= 10000) {
          var totalPointsnum = (totalPoints / 10000).toFixed(2) + '万';
        }else{
          totalPointsnum = totalPoints;
        }
        this.setData({
          countNumber: totalPoints,
          totalPoints: totalPoints
        })
        // this.getjindu()
      } else if (res.data.errorCode == 5001) {
        this.onLogin();
      }
    })
  },
  openxiaoxi(){
    wx.requestSubscribeMessage({
      tmplIds: [''],
      success(res) { }
    })
  },
  resetTime(item, i, pointsItems) {
    if (!item) {
      pointsItems = [];
      clearInterval(timer);
      this.setData({
        pointsItems: []
      })
      return;
    }
    var dealinTime = item.startTime;
    var timestamp = new Date().getTime();
    var time1 = parseInt((dealinTime - timestamp) / 1000 + 60);
    var that = this;
    var timer = setInterval(function() {
      if (!pointsItems) {
        pointsItems = []
        clearInterval(timer);
        that.setData({
          pointsItems: []
        })
      }
      var hour = parseInt(time1 / 3600) % 24 > 9 ? parseInt(time1 / 3600) % 24 : '0' + parseInt(time1 / 3600) % 24,
        minute = parseInt(time1 / 60 % 60) > 9 ? parseInt(time1 / 60 % 60) : '0' + (parseInt(time1 / 60 % 60));
      time1--;
      if (time1 < 60) {
        that.getToday('')
        //调用场景图接口
      }
      var str = hour + ':' + minute
      if (pointsItems) {
        pointsItems[i].time = str;
        that.setData({
          hastime: true,
          isShow: true,
          pointsItems: pointsItems
        })
      }
    }, 1000)
    var timeItem = this.data.timeItem;
    timeItem.push(timer)
    this.setData({
      timeItem: timeItem
    })
  },

  goGonglue() {
    wx.navigateTo({
      url: '/pages/gonglue/gonglue',
    })
  },
  gomanghe(){
    wx.switchTab({
      url: '/pages/activitylist/activitylist',
    })
  },
  collect(e) {
    var id = e.currentTarget.dataset.item.id;
    var index = e.currentTarget.dataset.index;
    this.animation = wx.createAnimation({
      duration: 250,
      timingFunction: 'ease',
      delay: 100
     });
     this.animation1 = wx.createAnimation({
      duration: 250,
      timingFunction: 'ease',
      delay: 150
     });
     this.animation2 = wx.createAnimation({
      duration: 250,
      timingFunction: 'ease',
      delay: 200
     });
    var differx = '',differy = '';
    let query = wx.createSelectorQuery()
    query.selectViewport().scrollOffset()
    // this.setData({
    //   showindex: index
    // })
    // query.select('#gouqi-'+index).boundingClientRect( (rect) => {
    //   let top = rect.top;
    //   console.log(rect.left,rect.top)
    //   differx = rect.left-16,differy = rect.top-22;
    //   this.translate(differx,differy)
    // }).exec()
    // return
    util.request('lanmao/mp/home/points/collect/' + id, 'POST', '', '', (res) => {
      if (res.data.errorCode == 0) {
        this.setData({
          showindex: index
        })
        this.getmedal()
        this.collectResetData(index)
        this.getGouqi();
        this.getmedal()
          query.select('#gouqi-'+index).boundingClientRect( (rect) => {
            let top = rect.top;
            console.log(rect.left,rect.top)
            differx = rect.left-16,differy = rect.top-22;
            this.translate(differx,differy)
          }).exec()
      } else if (res.data.errorCode == 5001) {
        this.onLogin();
      } else if (res.data.errorCode == 1){//弹框
        this.getslogan(res.data.message)
      }
    })
  },
  translate (differx,differy) {
    console.log(differx,differy)
    this.animation.translate(-differx, -differy).step()
    this.animation1.translate(-differx, -differy).step()
    this.animation2.translate(-differx, -differy).step()
    this.setData({ 
      animation: this.animation.export(), 
      animation1: this.animation1.export(),
      animation2: this.animation2.export() 
    })
    setTimeout(()=>{
      this.animation = wx.createAnimation({
        duration: 10,
        timingFunction: 'ease',
        delay: 10
       });
       this.animation1 = wx.createAnimation({
        duration: 10,
        timingFunction: 'ease',
        delay: 10
       });
       this.animation2 = wx.createAnimation({
        duration: 10,
        timingFunction: 'ease',
        delay: 10
       });
       this.animation.translate(0, 0).step()
        this.animation1.translate(0, 0).step()
        this.animation2.translate(0,0).step()
        this.setData({ 
          animation: this.animation.export(), 
          animation1: this.animation1.export(),
          animation2: this.animation2.export(),
          showindex: null
        })
    },500)
   
  },
  // 未到收集时间弹框
  getslogan(message){
    util.request('lanmao/mp/home/slogan', 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        this.toast.showToast('<p>'+message + ' </p><p>' + res.data.data.text +'</p>');
      } else if (res.data.errorCode == 5001) {
        this.onLogin();
      } 
    })
  },
  goPoints(){
    wx.navigateTo({
      url: '/pages/pointsList/pointsList',
    })
  },
  // 不用登陆也能获取数据的接口  更多枸杞列表 邀请好友的积分接口
  getnologinInfo(){
    var that = this;
    util.request('lanmao/mp/home/points/task', 'GET', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
        that.setData({
            activityData: res.data.data,
          })
         
      } 
    })
  },
  getmedal(){
    var that = this;
    util.request('lanmao/mp/home/medal', 'GET', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
        console.log(res.data.data.userPunchCard)
          this.setData({
            totalDays: res.data.data.totalDays,
            medaldata: res.data.data.medalList,
            userPunchCard: res.data.data.userPunchCard
          })
      } 
    })
  },
  getpointstask(){
    var that = this;
    util.request('lanmao/mp/home/points/task/10', 'GET', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
          this.setData({
            count: res.data.data[0].completedCount,
            quantity: res.data.data[0].quantity,
            homecontent: res.data.data[0].content,
          })
      } 
    })
  },
  getHomeInfo(type) {
    var that = this;
    util.request('lanmao/mp/home', 'GET', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
        var timer = setInterval(function(){
          that.setTimeer()
        },1000)
        that.setData({
          itemtimer: timer,
          hasLogin: true,
          hasData: true,
          showAuthorizephone: false,
          showAuthorize: false,
        })
        var ipImg = '',adultImgUrl = '',updateDate = '';
        ipImg = res.data.data.image.imgUrl;
        adultImgUrl = res.data.data.image.adultImgUrl;
        that.setData({
          bacImg: res.data.data.background.imgUrl,
          adultPoints: res.data.data.image.adultPoints,
          ipImg: ipImg,
          adultImgUrl: adultImgUrl
        })
        var pointsItems = res.data.data.pointsItems;
        that.setData({
          pointsItems: pointsItems
        })
        if (pointsItems.length != 0) {
          that.resetData(pointsItems);
        } 
        if(type != 1){
          that.getUser('');
          that.getGouqi();
          that.getDanmu();
          that.getnotice()
          that.getmedal()
          // that.getinvite();
        }
      } else if (res.data.errorCode == 5001) {
        that.onLogin('getHomeInfo');
      }
    })
  },
  getPercent(num, num1) {
    num = parseFloat(num);
    num1 = parseFloat(num1);
    if (isNaN(num) || isNaN(num1)) {
      return "-";
    }
    return num1 <= 0 ? "0%" : (Math.round(num / num1 * 10000) / 100.00) + "%";
  },
 
  //监听组件传来的消息
  onevent(e){
    this.setData({
      showYindao:true,
    })
    if(e.detail.source == 'getHomeInfo'){
      this.getHomeInfo();
    }else if(e.detail.source == 'goPublish'){
      this.goPublish()
    }
  },
  goCommunity(e){
    var linkUrl = e.currentTarget.dataset.linkurl;
    var id = e.currentTarget.dataset.id;
    var item = e.currentTarget.dataset.item;
    console.log(e.currentTarget.dataset.item)
    if(linkUrl){
      getApp().globalData.source = 'refreshPage';
      if(linkUrl.indexOf('community')>=0 || linkUrl.indexOf('activitylist')>=0){
        wx.switchTab({
          url: linkUrl,
        })
      }else{
        wx.navigateTo({
          url: linkUrl
        })
      }
    }else{
      if(id == '27'){//观看视频
        this.loadVideo()
      }else if(id == '32'){//赠险
        if(wx.getStorageSync('phone')){
          wx.navigateTo({
            url: "/pages/insurance/insurance"
          })
        }else{
          this.getUser("showphone")
        }
      }
    }
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
              that.setData({
                showAuthorize: true,
                source: source
              })
              if(source =='getHomeInfo'){
                that.setData({
                  nologinButtonimg: "https://oss.ifxj.com/lanmao/health/nologinButton.png?"+Date.parse(new Date()),
                  todayLikeCount: 0,
                  todayPostCount: 0,
                  hasLogin: false,
                  hasData: true,
                  bacImg: 'https://oss.ifxj.com/lanmao/health/nologinback.png?'+Date.parse(new Date()),
                  totalPoints: 1,
                  adultPoints: 10,
                  ipImg: 'https://oss.ifxj.com/lanmao/cartoonimage/g1.gif?'+Date.parse(new Date()),
                })
              }
              // that.getuserInfo()
            } else if (loginres.data.errorCode == 0) {
              wx.setStorageSync('token', loginres.data.data.token)
              wx.setStorageSync('loginInfo', JSON.stringify(loginres.data.data))
              that.setData({
                userId: loginres.data.data.id,
                navBarName: loginres.data.data.nickname
              })
              wx.setNavigationBarTitle({
                title: that.data.navBarName
              })
              if(source == 'playcomplete'){
                that.playcomplete()
              }else if(source == 'getnotice'){
                that.getnotice()
              }else{
                that.getHomeInfo('');
              }
            }
          })
        }
      },
      fail: function(res) {}
    })
  },
  openAuthorize(){
    this.setData({
      showAuthorize: true,
      source: 'getHomeInfo'
    })
  },
// 跳转海报页面
  goPoser(){
    if(!this.data.hasLogin){
      this.openAuthorize()
    }else{
      wx.navigateTo({
        url: '/pages/poster/poster',
      })
    }
   
  },
  //关闭引导页面
  closeYindao(){
    this.setData({
      showYindao: false,
    })
  },
})