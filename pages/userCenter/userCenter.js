const util = require('../../utils/util.js');
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userpage: 1,
    showdata: false,
    hasData: false,
    currentTab: 0,
    hasMoreData: true,
    tabIndex: 0,
    pageSize: 10,
    fixedNav: false,
    userName: '',
    navTab:['动态'],
    scrollH: 0,//屏幕高度
    imgWidth: 0,//图片展示宽度
    loadingCount: 0,
    images: [],
    col1: [],
    col2: [],
    col1H: 0,
    col2H: 0,
    marginTop: null,
    userInfo: {},
    tabNavh: null, 
    userId: '',
    userData: null,
    regInfo: null,
    showAuthorize: false,
    infotop: null,
    count: 0,
    iscare: false,
    fansCount: 0,
    nocontent:'',
    likeicon: '',
    nolikegrey: '',
    addIcon: ''
  },
  onLoad(options) {
    this.setData({
      userId: options.userId,
    })
  },
  //以本地数据为例，实际开发中数据整理以及加载更多等实现逻辑可根据实际需求进行实现   
  onShow: function () {
    this.setData({
      fixedNav: false,
      addIcon: 'https://oss.ifxj.com/lanmao/health/addIcon420.png?'+Date.parse(new Date()),
      nocontent: "https://oss.ifxj.com/lanmao/health/nocontent.png?"+Date.parse(new Date()),
      likeicon: 'https://oss.ifxj.com/lanmao/health/like.png?'+Date.parse(new Date()),
      nolikegrey:'https://oss.ifxj.com/lanmao/health/lickgrey.png?'+Date.parse(new Date())
    })
    if(wx.getStorageSync('isLikeobj')){
      var isLikeobj = JSON.parse(wx.getStorageSync('isLikeobj'));
      var data1 = this.data.col1,data2 = this.data.col2;
      for(let i in data1){
        if(isLikeobj.communityid == data1[i].id){
          data1[i].likeCount = isLikeobj.likeCount;
          data1[i].liked = isLikeobj.isLike;
        }
      }
      for(let i in data2){
        if(isLikeobj.communityid == data2[i].id){
          data2[i].likeCount = isLikeobj.likeCount;
          data2[i].liked = isLikeobj.isLike;
        }
      }
      this.setData({
        col1: data1,
        col2: data2
      })
      wx.removeStorageSync('isLikeobj')
    }
    this.getCare()
    var device = wx.getSystemInfoSync();
    this.setData({
      infotop: (device.windowHeight - 390) / 2
    })
    this.setData({
      marginTop: wx.getStorageSync('navHeight')
    })
    wx.getSystemInfo({//获取系统的信息
      success: (res) => {
        let ww = res.windowWidth;
        let wh = res.windowHeight;
        let imgWidth = ww * 0.48;
        let scrollH = wh;

        this.setData({
          scrollH: scrollH,
          imgWidth: imgWidth
        });
        this.setData({
          tabIndex: 0,
          userpage: 1,
          images: [],
          col1: [],
          col2: [],
          col1H: 0,
          col2H: 0
        })
       
      }
    })
    let query = wx.createSelectorQuery()
    query.select('#index-nav').boundingClientRect( (rect) => {
        let top = rect.top
        this.setData({
          tabNavh: top,
      })
    }).exec();
    this.getcenterinfo()
  },
  goDetail(e){
    var id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/communityDetail/communityDetail?communityid=' + id
      })
  },
  cancleLike(e){
    if(e){
      var liked = e.currentTarget.dataset.liked;
      var id = e.currentTarget.dataset.id;
      var direct = e.currentTarget.dataset.direct;
      var index = e.currentTarget.dataset.index;
      this.setData({
        likeId: id,
        liked: liked,
        direct: direct,
        index: index
      })
    }
    if(!liked){
      this.clickLike()
    }else{
      util.request('lanmao/community/post/'+id+'/unlike', 'POST', '', '', (res) => {
        if (res.data.errorCode == 0) {
          if(direct == 'col1'){
            var data = this.data.col1;
            for(let i in data){
              if(i == index){
                data[i].likeCount--
                data[i].liked = false;
              }
            }
            this.setData({
              col1: data
            })
          }else if(direct == 'col2'){
            var data = this.data.col2;
            for(let i in data){
              if(i == index){
                data[i].likeCount--;
                data[i].liked = false;
              }
            }
            this.setData({
              col2: data
            })
          }
        } else if (res.data.errorCode == 5001) {
          this.onLogin('cancleLike');
        }
      })
    }
  
  },
  clickLike(){
    var direct = this.data.direct;
    var index = this.data.index;
    util.request('lanmao/community/post/'+this.data.likeId+'/like', 'POST', '', '', (res) => {
      if (res.data.errorCode == 0) {
        if(direct == 'col1'){
          var data = this.data.col1;
          for(let i in data){
            if(i == index){
              data[i].likeCount++;
              data[i].liked = true
            }
          }
          this.setData({
            col1: data
          })
        }else{
          var data = this.data.col2;
          for(let i in data){
            if(i == index){
              data[i].likeCount++;
              data[i].liked = true
            }
          }
          this.setData({
            col2: data
          })
        }
       
      } else if (res.data.errorCode == 5001) {
        this.onLogin('clickLike');
      }
    })
  },
  gofanlist(){
    wx.navigateTo({
      url: '/pages/fanlist/fanlist?userId='+this.data.userId+'&fromName='+this.data.userName
    })
  },
  followlist(){
    wx.navigateTo({
      url: '/pages/followlist/followlist?userId='+this.data.userId+'&fromName='+this.data.userName 
    })
  },
  getCare(){
    var userid = this.data.userId;
    if(!userid){
      return;
    }
    util.request('lanmao/community/user/'+this.data.userId+'/isFollow' , 'post', '', '', (res) => {
      if (res.data.errorCode == 0) {
        this.setData({
          iscare: res.data.data
        })
      }
    })
  },
  care(){
    util.request('lanmao/community/user/'+this.data.userId+'/follow' , 'post', '', '', (res) => {
      if (res.data.errorCode == 0) {
        var fansCount = this.data.fansCount;
        fansCount++;
        this.setData({
          iscare: true,
          fansCount: fansCount
        })
      }else if (res.data.errorCode == 5001){
        this.onLogin('care');
      }
    })
  },
  cancleCare(){
    var that = this;
    wx.showModal({
      title: '',
      content: '是否取关?',
      success: function (sm) {
        console.log(sm)
        if (sm.confirm) {
          util.request('lanmao/community/user/'+that.data.userId+'/isFollow' , 'post', '', '', (res) => {
            if (res.data.errorCode == 0) {
              var fansCount = this.data.fansCount;
              fansCount--;
              that.setData({
                iscare: false,
                fansCount: fansCount
              })
            }else if (res.data.errorCode == 5001){
              that.onLogin('cancleCare');
            }
          })
          } else if (sm.cancel) {
          }
        }
      })
    
  },
  currentTab: function (e) {
    if (this.data.currentTab == e.currentTarget.dataset.idx) {
      return;
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    //传给社区页面
  },
    onPageScroll: function (e) {
      if(e.detail){
        this.setData({
          scrollTop: e.detail.scrollTop
      })
     
      if(e.detail.scrollTop>this.data.tabNavh-40){
        this.setData({
          fixedNav: true,
          top: 0
        })
        // top: wx.getStorageSync('navHeight')
      }else{
        this.setData({
          fixedNav: false,
          top: 0
        })
      }
      }
  },
  //获取用户信息
  getcenterinfo(){
    util.request('lanmao/community/user/'+this.data.userId, 'GET', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
        console.log(res.data)
        this.setData({
          userName: res.data.data.nickname,
          userData: res.data.data,
          fansCount: res.data.data.fansCount
        })
        wx.setNavigationBarTitle({
          title:  res.data.data.nickname
        })
         //加载首组图片
         this.loadImages();
      }
    })
  },
     //登录
     onLogin(source) {
      var that = this;
      wx.showLoading({
        title: '',
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
                if(source == 'loadImages'){
                    that.loadImages()
                }else if(source == 'cancleCare'){
                  that.cancleCare()
                }else if(source == 'care'){
                  that.care()
                }else{
                  that.onShow()
                }
                
              }else if (loginres.data.errorCode == 5010) { //重新获取code,弹框授权获取用户信息
                that.setData({
                  showAuthorize: true
                })
                // that.getuserInfo()
              }
            })
          }
        },
        fail: function (res) { }
      })
    },
    goDetail(e){
      var id = e.currentTarget.dataset.id;
        wx.navigateTo({
          url: '/pages/communityDetail/communityDetail?communityid=' + id
        })
    },
/**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log(this.data.hasMoreData)
    if (this.data.hasMoreData) {
      // this.setData({
      //   searchLoading: true//"上拉加载"的变量，默认false，隐藏  
      // })
      this.setData({
        userpage: this.data.userpage + 1
      })
      this.loadImages();
    } else {
    }
  },

  onImageLoad: function (i,length) {
    var that = this;
    var images = that.data.images;
        let imageId = images[i].id;
        let oImgW = images[i].imgWidth;         //图片原始宽度
        let oImgH = images[i].imgHeight;        //图片原始高度
        let imgWidth = that.data.imgWidth;  //图片设置的宽度
        let scale = imgWidth / oImgW;        //比例计算
        let imgHeight = oImgH * scale;      //自适应高度
        let imageObj = images[i];
        imageObj.height = imgHeight;
        //选择id
        let loadingCount = that.data.loadingCount - 1;
        let col1 = that.data.col1;
        let col2 = that.data.col2;
        let col1H = that.data.col1H;
        let col2H = that.data.col2H;
        //判断当前图片添加到左列还是右列
        if (col1H <= col2H) {
          col1H += imgHeight;
          col1.push(imageObj);
        } else {
          col2H += imgHeight;
          col2.push(imageObj);
        }
        let data = {
          loadingCount: loadingCount,
          col1: col1,
          col2: col2,
          col1H: col1H,
          col2H: col2H
        };
        if (!loadingCount) {
          data.images = [];
        }
        that.setData(data);
        if(++i<length){
          that.onImageLoad(i,length)
        }
  },
  loadImages: function () {
    var that = this;
    var page = '',url = '';
    page = that.data.userpage;
    url = 'lanmao/community/post';
    console.log(that.data.userId)
    var data = {
      topicId: '',
      page: page,
      size: that.data.pageSize,
      userId: that.data.userId,
      status: 1
    }
    util.request(url, 'GET', data, '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
        this.setData({
          showdata: true,
          count: res.data.data.total
        })
        var img = that.data.images;
        let images = img.concat(res.data.data.records);
        var data1 = [];
        var data2 = [];
        for(let i in images){
          if(images[i].likeCount>10000){
            images[i].likeCount = "1w+";
          }
          if(images[i].userNickname){
            if(images[i].userNickname.length>8){
              images[i].userNickname = images[i].userNickname.substring(0,6)+'...'
            }
          }
          if(i%2 == 0){
            data1.push(images[i])
          }else{
            data2.push(images[i])
          }
        }
        that.setData({
          loadingCount: images.length,
          images: images,
          col1: data1,
          col2: data2
        });
        if(res.data.data.records.length != 0){
          if(page == 1){
            that.setData({
              hasData: true
            })
          }
          // that.onImageLoad(0,images.length);
        }else{
          if(page == 1){
            that.setData({
              hasData: false
            })
          }
        }
        
        if (res.data.data.records.length < that.data.pageSize) {
          that.setData({
            hasMoreData: false,
            searchLoading: false,
            searchLoadingComplete: true
          })
        } else {
            that.setData({
              hasMoreData: true
            })
        }
       
      }else if(res.data.errorCode == '5001'){
        that.onLogin('loadImages')
      }
    })
    },
      //获取用户授权信息
   getInfo() {
    var that = this;
    wx.login({
      success(res) {
        wx.getUserInfo({
          lang: 'zh_CN',
          success: response => {
            that.setData({
              regInfo: {
                rawData: response.rawData,
                signature: response.signature,
                encryptedData: response.encryptedData,
                iv: response.iv
              }
            })
            that.userReg(res.code);
          }
        })
      }
    })
  },
  userReg(code) { //用户注册
    var that = this;
    wx.showLoading({
      title: ''
    })
    var regdata = {
      code: code,
      encryptedData: that.data.regInfo.encryptedData,
      iv: that.data.regInfo.iv,
      rawData: that.data.regInfo.rawData,
      signature: that.data.regInfo.signature,
      appid: util.appId,
      inviteUserId: that.data.inviteUserId
    }
    util.request('lanmao/mp/user/reg', 'POST', regdata, '', (regres) => {
      wx.hideLoading()
      if (regres.data.errorCode == 0) {
        wx.setStorageSync('token', regres.data.data.token);
        that.setData({
          showAuthorize: false
        })
        that.onShow()
      }
    })
  },
  getUserInfo(e) {
    //登录
    if (e.detail.userInfo) {
      App.globalData.userInfo = e.detail.userInfo
      if (!this.data.userInfo) {
        this.setData({
          userInfo: e.detail.userInfo,
          hasUserInfo: true
        })
        wx.showToast({
          title: '授权成功',
          icon: 'success',
          duration: 1500
        })
      }
      this.getInfo()
    } else {
      wx.showModal({
        title: '提示',
        content: '若不授权微信登录，则无法使用小程序。点击"授权"按钮并允许使用"用户信息"方可正常使用。',
        showCancel: false,
        confirmText: '授权',
        success: (res => {
          wx.openSetting({
            success: (res) => {}
          })
        })
      })
    }
  }
  })
 