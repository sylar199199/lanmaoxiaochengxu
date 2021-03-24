const util = require('../../utils/util.js');
Page({
  data:{
    userpage: 1,
    nocontent: '',
    showdata: false,
    hasData: false,
    code: '',
    showAuthorizephone: false,
    source: null,
    pageSize: 10,
    showCode: false,
    userInfo: '',
    switch1Checked: true,
    switch1Style: '',
    switchcolor: '#F34848',
    userId: '',
    authtop:0,
    images: [],
    col1: [],
    col2: [],
    col1H: 0,
    col2H: 0,
    tabNavh: '', 
    navTab:['动态','赞过'],
    secnavTab: [{name: '所有动态',value:'0'},{name: '本地草稿',value:'0'}],
    fixedNav: false,
    currentTab: 0,
    seccurrentTab: 0,
    marginTop: 0,
    showAuthorize: false,
    infotop: null,
    userData: '',
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: true, //“没有数据”的变量，默认false，隐藏  
    help1: 'https://oss.ifxj.com/lanmao/health/help1.png?'+Date.parse(new Date()),
    gouqigonglue: 'https://oss.ifxj.com/lanmao/health/gouqigonglue.png?'+Date.parse(new Date()),
    orderIcon: 'https://oss.ifxj.com/lanmao/health/orderIcon.png?'+Date.parse(new Date()),
    dizhi1: 'https://oss.ifxj.com/lanmao/health/dizhi1.png?'+Date.parse(new Date()),
    nocontent: "https://oss.ifxj.com/lanmao/health/nocontent.png?"+Date.parse(new Date()),
    likeicon: 'https://oss.ifxj.com/lanmao/health/like.png?'+Date.parse(new Date()),
    nolikegrey:'https://oss.ifxj.com/lanmao/health/lickgrey.png?'+Date.parse(new Date())
  },
  //监听组件传来的消息
  onevent(e){
    console.log(e.detail.source)
    if(e.detail.source == 'loadImages'){
      this.loadImages();
    }else if(e.detail.source == 'getcenterinfo'){
      this.getcenterinfo()
    }else if(e.detail.source == 'getpersonInfo'){
      this.getpersonInfo()
    }
  },
   //监听手机号授权组件传来的消息
   phonevent(e){
    if(!e.detail.showAuthorizephone){
      this.setData({
        showAuthorizephone: false
      })
    }
  },
  //发布动态
  goPublish(){
    this.getInfo()
   },
   getInfo(){
     var that = this;
     util.request('lanmao/mp/user/user/info', 'GET', '', '', (loginres) => {
       wx.hideLoading()
       if (loginres.data.errorCode == 0) {
         wx.setStorageSync('userId', loginres.data.data.id)
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
           wx.navigateTo({
             url: '/pages/releasedynamics/releasedynamics'
           })
         }
       } else if (loginres.data.errorCode == 5001) {
         this.onLogin('goPublish');
       }
     })
   },
  adressList(){
    wx.navigateTo({
      url: '/pages/adressList/adressList',
    })
  },
  goOrderlist() {
    wx.navigateTo({
      url: '/pages/orderList/orderList',
    })
  },

  onShow(){
    this.setData({
      fixedNav: false,
      
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
    var device = wx.getSystemInfoSync();
    this.setData({
      authtop: (device.windowHeight - 450) / 2
    })

    if (wx.getStorageSync('loginInfo')) {
      this.setData({
        userId: JSON.parse(wx.getStorageSync('loginInfo')).id
      })
    }
    this.getpersonInfo();
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
    }).exec()
  },
  onLoad(){
  
  },
  openCode(){
    this.setData({
      showCode: true
    })
  },
  closeCode(){
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
  // onShareAppMessage: function () {
  //   return {
  //     title: "在吗？帮我点一下！你也可以得到奖励",
  //     path: `/pages/home/home?inviteUserId=` + + wx.getStorageSync('userId'),
  //     imageUrl: 'https://oss.ifxj.com/lanmao/health/shareimg0224.png'
  //   }
  // },
  goGonglue(){
    wx.navigateTo({
      url: '/pages/gonglue/gonglue',
    })
  },
  switchChange(e){
    this.setData({
      switch1Checked: e.detail.value
    })
    wx.setStorageSync('switch1Checked', this.data.switch1Checked)
  },
  getpersonInfo(){
    util.request('lanmao/mp/user/user/info', 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        wx.setStorageSync('userId', res.data.data.id)
        this.setData({
          showAuthorizephone: false,
          showAuthorize: false,
          userInfo: res.data.data,
          userId: res.data.data.id
        })
        wx.setNavigationBarTitle({
          title: res.data.data.nickname
        })
         //加载首组图片
         this.loadImages();
         this.getcenterinfo()
      } else if (res.data.errorCode == 5001) {
        this.onLogin('getpersonInfo');
      }
    })
  },
  goPoser(){
    wx.navigateTo({
      url: '/pages/poster/poster',
    })
  },
 //获取用户信息
 getcenterinfo(){
  util.request('lanmao/community/user/'+this.data.userId, 'GET', '', '', (res) => {
    wx.hideLoading()
    if (res.data.errorCode == 0) {
      this.setData({
        userData: res.data.data,
        fansCount: res.data.data.fansCount
      })
      var secnavTab = this.data.secnavTab;
      secnavTab[0].value = res.data.data.postCount;
      secnavTab[1].value = res.data.data.draftCount;
      this.setData({
        secnavTab: secnavTab
      })
    }
  })
},
gofanlist(){
  wx.navigateTo({
    url: '/pages/fanlist/fanlist?userId='+this.data.userId 
  })
},
followlist(){
  wx.navigateTo({
    url: '/pages/followlist/followlist?userId='+this.data.userId 
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
              if(source == 'loadImages'){
                  that.loadImages()
              }else if(source == 'getcenterinfo'){
                  that.getcenterinfo()
              }else if(source == 'care'){
                  that.care()
              }else if(source == 'getpersonInfo'){
                that.getpersonInfo()
              }else if(source == 'goPublish'){
                that.goPublish()
              }else if(source == 'clickLike'){
                that.clickLike()
              }else if(source == 'cancleLike'){
                that.cancleLike()
              }else{
                that.onShow()
              }
              
            }else if (loginres.data.errorCode == 5010) { //重新获取code,弹框授权获取用户信息
              that.setData({
                showAuthorize: true,
                source: source
              })
              // that.getuserInfo()
            }
          })
        }
      },
      fail: function (res) { }
    })
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
    }else{
      this.setData({
        fixedNav: false,
        top: 0
      })
    }
    }
},
  currentTab: function (e) {
    if (this.data.currentTab == e.currentTarget.dataset.idx) {
      return;
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    this.setData({
      searchLoadingComplete: false,
      userpage: 1,
      images: [],
      col1: [],
      col2: [],
      col1H: 0,
      col2H: 0
    })
    this.loadImages()
  },
  seccurrentTab: function (e) {
    if (this.data.seccurrentTab == e.currentTarget.dataset.idx) {
      return;
    }
    this.setData({
      seccurrentTab: e.currentTarget.dataset.idx
    })
    this.setData({
      searchLoadingComplete: false,
      userpage: 1,
      page: 1,
      images: [],
      col1: [],
      col2: [],
      col1H: 0,
      col2H: 0
    })
    this.loadImages()
  },
  goDetail(e){
    var id = e.currentTarget.dataset.id;
    if(this.data.currentTab == 0){
      var status = e.currentTarget.dataset.status;
      var source = 'person'
      wx.navigateTo({
        url: '/pages/communityDetail/communityDetail?communityid=' + id+"&status="+status+'&source='+source
      })
    }else{
      var status = e.currentTarget.dataset.status;
      var source = 'person'
      wx.navigateTo({
        url: '/pages/communityDetail/communityDetail?communityid=' + id
      })
    }
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
      var url = '';
      var status = '';
      var likeUserId = '';
      var userId = '';
      if(this.data.currentTab == 0){
        likeUserId = '';
        userId =  that.data.userId;
        if(!userId){
          userId = null;
        }
        url = 'lanmao/community/post/user';
        if(this.data.seccurrentTab == 0){
          status = 1;
        }else if(this.data.seccurrentTab == 1){
          status = 0
        }
      }else if(this.data.currentTab == 1){
        userId = '';
        likeUserId = that.data.userId;
        url = 'lanmao/community/post';
      }
      var data = {
        likedUserId: likeUserId,
        page: page,
        size: that.data.pageSize,
        userId: userId,
        status: status
      }
      util.request(url, 'GET', data, '', (res) => {
        wx.hideLoading()
        if (res.data.errorCode == 0) {
          this.setData({
            count: res.data.data.total
          })
          if(res.data.data.records.length != 0){
            if(page == 1){
              that.setData({
                showdata: true,
                hasData: true
              })
            }
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
          }else{
            if(page == 1){
              that.setData({
                showdata: true,
                hasData: false
              })
            }
            that.setData({
              hasMoreData: false,
              searchLoading: false,
              searchLoadingComplete: false
            })
          }
          
         
        }else if(res.data.errorCode == '5001'){
          that.onLogin('loadImages')
        }
      })
      },
  
  
   
})