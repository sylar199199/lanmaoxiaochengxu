const util = require('../../utils/util.js');
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nowdata: new Date().getTime(),
      goodsList: [], // 商品列表1
      allgoodsList: [],
      listcopy: '',
      alllistcopy : [],
      starttime: '', // 开始时间
      endtime: '', // 结束时间
      currentTime: '', // 当前时间
      timesetting: '', // 设置定时器
      settingtime: '',
      iconlist: [], // 倒计时数据
      tickertwo: null,// 这里是two是因为前面我也有倒计时
      d: "",
      h: "",
      m: "",
      s: "",
      setint: null,
      hideData: false,
    testtrue: true,
    posterData: [],
    topicData: [],
    scrollLeft: 0,
    nocontent: '',
    showdata: false,
    hasData: false,
    showAuthorizephone: false,
    freshStatus: 'more', // 当前刷新的状态
    showRefresh: false,   // 是否显示下拉刷新组件
    source: null,
    showAuthorize: false,
    hasMoreData: true,
    userpage: 1,
    tabIndex: 0,
    page: 1,
    pageSize: 10,
    scrollH: 0,//屏幕高度
    imgWidth: 0,//图片展示宽度
    loadingCount: 0,
    images: [],
    col1: [],
    col2: [],
    col1H: 0,
    col2H: 0,
    fromsource: null,
    marginTop: null,
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏  
    downloadicon: 'https://oss.ifxj.com/lanmao/health/downloadicon.png?'+Date.parse(new Date()),
    likeicon: 'https://oss.ifxj.com/lanmao/health/like.png?'+Date.parse(new Date()),
    nocontent: "https://oss.ifxj.com/lanmao/health/nocontent.png?"+Date.parse(new Date()),
    nolikegrey: 'https://oss.ifxj.com/lanmao/health/lickgrey.png?'+Date.parse(new Date()),
    publishIcon: 'https://oss.ifxj.com/lanmao/health/publishIcon.png?'+Date.parse(new Date()),
    fresh: 'https://oss.ifxj.com/lanmao/health/fresh12.gif?'+Date.parse(new Date()),
    
    
  },
  onShow(){
    this.gettopic()
    if(this.data.posterData){
      this.beginTimer()
    }
    var source = getApp().globalData.source;
    if(source){
      this.setData({
        fromsource: source
      })
      getApp().globalData.source = '';
    }
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
    if(this.data.fromsource){
      this.setData({
        tabIndex: 0,
        userpage: 1,
        page: 1,
        images: [],
        col1: [],
        col2: [],
        col1H: 0,
        col2H: 0
      })
      //加载首组图片
      this.loadImages();
    }

  },
  onLoad: function (options) {
    if (options.inviteUserId) {
      wx.setStorageSync('inviteUserId',this.data.inviteUserId)
      wx.setStorageSync('inviteType',this.data.inviteType)
      this.setData({
        inviteUserId: options.inviteUserId,
        inviteType: options.inviteType,
        showAuthorize: false
      })
    }
    this.setData({
      marginTop: wx.getStorageSync('navHeight'),
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
        if(getApp().globalData.source){

        }else{
          
          this.setData({
            tabIndex: 0,
            userpage: 1,
            page: 1,
            images: [],
            col1: [],
            col2: [],
            col1H: 0,
            col2H: 0
          })
          //加载首组图片
          this.loadImages();
        }
        
      }
    })
  },
//    //分享配置
//    onShareAppMessage: function() {
//     var that = this;
//     return {
//       title: "@"+this.data.contentdata.userNickname+"发了一篇超赞的动态，快点来看！",
//       path: `/pages/community/community?inviteUserId=` + wx.getStorageSync('userId')+'&inviteType=3',
//     }
// },
  gettopic(){
    util.request('lanmao/community/post/topic', 'GET', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 5001) {
        this.onLogin('gettopic')
      } else if (res.data.errorCode == 0) {
        var topicData = res.data.data;
        for(let i in topicData){
          topicData[i].point = "#";
          topicData[i].isSelect = false;
        }
        this.setData({
          topicData: topicData
        })
      }
    })
  },
  _evalutionItemClick(e){
    var id = e.currentTarget.dataset.id;
    var topicName = e.currentTarget.dataset.name;
    this.getInfo('_evalutionItemClick',id,topicName)
   
  },
 
  deleteItem(){
    util.request('lanmao/community/post/3', 'DELETE', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
       
       
      } else if (res.data.errorCode == 5001) {
        this.onLogin('cancleLike');
      }
    })
  },
  cancleLike(e){
    // wx.showLoading()
    if(e){
      var direct = e.currentTarget.dataset.direct;
      var liked = e.currentTarget.dataset.liked;
      var id = e.currentTarget.dataset.id;
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
        wx.hideLoading()
        if (res.data.errorCode == 0) {
         if(this.data.direct == 'col1'){
          var data = this.data.col1;
          for(let i in data){
            if(i == this.data.index){
              data[i].likeCount--
              data[i].liked = false;
            }
          }
          this.setData({
            col1: data
          })
        }else if(this.data.direct == 'col2'){
          var data = this.data.col2;
          for(let i in data){
            if(i == this.data.index){
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
    var index = this.data.index;
    var direct = this.data.direct;
    util.request('lanmao/community/post/'+this.data.likeId+'/like', 'POST', '', '', (res) => {
      if (res.data.errorCode == 0) {
        wx.hideLoading()
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
  //监听组件传来的消息
  onevent(e){
    if(e.detail.source == 'loadImages'){
      this.loadImages();
    }else if(e.detail.source == 'goPublish'){
      this.goPublish()
    }
  },
   //监听手机号授权组件传来的消息
   phonevent(e){
    if(!e.detail.showAuthorizephone){
      this.setData({
        showAuthorizephone: false
      })
      // this.goPublish()
    
    }
  },
  goDetail(e){
    var id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/communityDetail/communityDetail?communityid=' + id
      })
  },
  isregister(e){
    this.setData({
      showAuthorize: true,
      source: 'goPublish'
    })
  },
  isbindPhone(e){
    console.log(e)
    this.setData({
      showAuthorizephone: true,
      code: e.detail.code
    })
  },
  

// 触摸开始
touchStart(e) {
  this.setData({
    startY: e.changedTouches[0].pageY,
    freshStatus: 'more'
  })
},
// 触摸移动
touchMove(e) {
  let endY = e.changedTouches[0].pageY;
  let startY = this.data.startY;
  let dis = endY - startY;
  // 判断是否下拉
  if (dis <= 0) {
    return;
  }
  let offsetTop = e.currentTarget.offsetTop;
  if (dis > 20) {
    this.setData({
      showRefresh: true
    }, () => {
      if (dis > 50) {
        this.setData({
          freshStatus: 'end'
        })
      } else {
        this.setData({
          freshStatus: 'more'
        })
      }
    })
  } else {
    this.setData({
      showRefresh: false
    })
  }
},
// 触摸结束
touchEnd(e) {
  if (this.data.freshStatus == 'end') {
    // 延迟 500 毫秒，显示 “刷新中”，防止请求速度过快不显示
    setTimeout(()=>{
         // 获取最新列表数据
        let that = this
        that.setData({
          userpage: 1,
          page: 1,
          images: [],
          col1: [],
          col2: [],
          col1H: 0,
          col2H: 0,
          searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
          searchLoadingComplete: false //“没有数据”的变量，默认false，隐藏  
        })
        that.loadImages();
    }, 500);
  } else {
    this.setData({
      showRefresh: false
    })
  }
},
  //切换tab
  changeTab(event){
    this.setData({
      tabIndex: event.detail.value,
      searchLoadingComplete: false,
      userpage: 1,
      page: 1,
      images: [],
      col2: [],
      col1: [],
      col1H: 0,
      col2H: 0
    })
    console.log(event.detail.value)
    if(event.detail.value == 2){
        this.getPoster()

    }else{
      this.loadImages();
    }
  },
  downloadImg(e){
    var url = e.currentTarget.dataset.url;
    var id = e.currentTarget.dataset.id;
    this.setData({
      testtrue: false,
      posterUrl: url,
      posterId: id
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
                  var id = that.data.posterId;
                  var posterUrl = that.data.posterUrl;
                  util.request('lanmao/community/activity/poster/'+id+'/save', 'POST', '', '', (res) => {
                    if (res.data.errorCode == 0){
                      wx.getImageInfo({
                        src: posterUrl,
                        success (response) {
                          console.log(response.path)
                          wx.saveImageToPhotosAlbum({
                            filePath: response.path,
                            success(res) {
                              wx.showToast({
                                title: '已保存在相册中',
                                mask: true
                              })
                             }
                          })
                        }
                      })
                    
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
              var id = that.data.posterId;
              var posterUrl = that.data.posterUrl;
              util.request('lanmao/community/activity/poster/'+id+'/save', 'POST', '', '', (res) => {
                if (res.data.errorCode == 0){
                  wx.getImageInfo({
                    src: posterUrl,
                    success (response) {
                      console.log(response.path)
                      wx.saveImageToPhotosAlbum({
                        filePath: response.path,
                        success(res) {
                          wx.showToast({
                            title: '已保存在相册中',
                            mask: true
                          })
                         }
                      })
                    }
                  })
                
                }else if (res.data.errorCode == 5001){
                  wx.hideLoading();
                    that.onLogin('isUserwritePhotos')
                }
              })
            
            }
          }
        })
      },
      onUnload() {
        clearInterval(this.data.tickertwo)
      },
      onHide() {
        clearInterval(this.data.tickertwo)
      },
      beginTimer() { //这个计时器是每秒减去数组中指定字段的时间
        let vm = this;
        var posterData = this.data.posterData;
         var tickertwo = setInterval(() => {
          //数据循环，因为要每一列数据都要倒计时，所以要对每一列的数据进行处理
            for (let i = 0, len = posterData.length; i < len; i++) {
              const item = posterData[i];
              //这里是，当前时间 > 开始时间 && 当前时间 < 结束时间 的 倒计时
              if (item.isshowTime) {
              //这里还是对数据的处理，因为是赋值的原因，所以对item操作就是对原来数据的操作，这里就对应之前为什么要用深拷贝把原本数据拷贝一份进行操作的原因
                vm.time(item.time,posterData,i)
                item.time = item.endTime - new Date().getTime();
                // item.time = item.time - 1000;
              }
            }
          }, 1000);
          this.setData({
            tickertwo: tickertwo
          })
        },
    
    time(time,posterData,i) { //这个函数是把计算出来的倒计时进行转换，在html里面显示倒计时那里直接用的
          if (time >= 0) {
            var time1 = parseInt(time / 1000);
            let d = parseInt(time1 / 60 / 60 / 24);
            let h = parseInt(time1 / 3600) % 24;
            let m = parseInt(time1 / 60 % 60);
            let s = parseInt(time1 % 60);
            h = h < 10 ? '0' + h : h;
            m = m < 10 ? '0' + m : m;
            s = s < 10 ? '0' + s : s;
            posterData[i].d = d;
            posterData[i].h = h;
            posterData[i].m = m;
            posterData[i].s = s;
            this.setData({
              posterData: posterData
            })
          }
          if (time < 0) {
            posterData[i].isshowTime = false;
            this.setData({
              posterData: posterData
            })
            clearInterval(this.data.tickertwo)
            this.beginTimer()
            return
          }
    },
  getPoster(){
    util.request('lanmao/community/activity/poster', 'GET', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
        console.log(res)
       
        var posterData = res.data.data;
        var n = 0;
        if(posterData.length == 0){
          this.setData({
            hideData: true
          })
        }else{
          for(let i in posterData){
            // 当前时间大于结束时间，已经结束的活动
            if (this.data.nowdata > posterData[i].endTime) {
              posterData[i].isshowTime = false;
              posterData[i].isshowContent = true;
  
            }
               // 当前时间小于开始时间，未开始的活动
            if (this.data.nowdata < posterData[i].startTime) {
              posterData[i].isshowContent = false;
              n++
  
            }
            // 当前时间大于开始时间，小于结束时间，进行中的活动
            if ((this.data.nowdata >= posterData[i].startTime) && (this.data.nowdata <= posterData[i].endTime)) {
              posterData[i].isshowContent = true;
              posterData[i].isshowTime = true;
              posterData[i].time = posterData[i].endTime - new Date().getTime();
  
            }
          }
          if(n == posterData.length){
            this.setData({
              hideData: true
            })
          }else{}
            this.setData({
              hideData: false
            })
          this.setData({
            posterData: posterData
          })
          if (this.data.tickertwo) { //这一段是防止进入页面出去后再进来计时器重复启动
            clearInterval(this.data.tickertwo)
          }
          //进行数据的计算 -1000 毫秒
          this.beginTimer() //启动计时器减指定字段的时间
        }
      
      }else if (res.data.errorCode == 5001) { //重新获取code,弹框授权获取用户信息
       
      }
    })
  },
     //登录
     onLogin(soure) {
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
                if(soure == 'goPublish'){
                  wx.navigateTo({
                    url: '/pages/releasedynamics/releasedynamics'
                  })
                }else if(soure == 'loadImages'){
                  that.loadImages()
                }else if(soure == 'clickLike'){
                  that.clickLike()
                }else if(soure == 'cancleLike'){
                  that.cancleLike()
                }
                else if(soure == 'gettopic'){
                  that.gettopic()
                }
                else if(soure == 'isUserwritePhotos'){
                  that.isUserwritePhotos()
                }
                
              }else if (loginres.data.errorCode == 5010) { //重新获取code,弹框授权获取用户信息
                if(soure == 'goPublish'){
                  that.setData({
                    source: 'goPublish'
                  })
                }else if(soure == 'loadImages'){
                  that.setData({
                    source: 'loadImages'
                  })
                }
                that.setData({
                  showAuthorize: true
                })
              }
            })
          }
        },
        fail: function (res) { }
      })
    },
  goPublish(){
   this.getInfo('goPublish')
  },
  getInfo(source,id,topicName){
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
          that.setData({
            showAuthorizephone: false
          })
          if(source == 'goPublish'){
            wx.navigateTo({
              url: '/pages/releasedynamics/releasedynamics'
            })
          }else if(source == '_evalutionItemClick'){
            wx.navigateTo({
              url: '/pages/topicList/topicList?topicId=' + id+"&topicName="+topicName
            })
          }
         
        }
      } else if (loginres.data.errorCode == 5001) {
        this.onLogin(source);
      }
    })
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
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      if(this.data.tabIndex == 1){
        this.setData({
          userpage: this.data.userpage + 1
        })
      }else{
        this.setData({
          page: this.data.page + 1
        })
      }
      this.loadImages();
    } else {
     
    }
  },
  loadImages: function () {
    // wx.showLoading();
    var that = this;
    var page = '',url = '';
    if(that.data.tabIndex == 0){
      page = that.data.page;
      
      url = 'lanmao/community/post';
    }else{
      page = that.data.userpage;
      url = 'lanmao/community/post/follow';
    }
    var data = {
      page: page,
      size: that.data.pageSize,
      userId: '',
      status: 1
    }
    util.request(url, 'GET', data, '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
        if(url == 'lanmao/community/post/follow'){
          that.setData({
            showAuthorizephone: false,
            showAuthorize: false,
          })
        }
        if(res.data.data.records.length != 0){
          if(page == 1){
            that.setData({
              showdata: true,
              hasData: true
            })
          }
          if (res.data.data.records.length < that.data.pageSize) {
            that.setData({
              hasMoreData: false,
              searchLoading: false,
              searchLoadingComplete: true
            })
          } else {
            that.setData({
              hasMoreData: true,
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
            searchLoadingComplete: true
          })
        }
        that.setData({
          showRefresh: false
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
      
       
       
       
      }else if(res.data.errorCode == 5001){
        this.onLogin('loadImages')
       
      }
    })
    
    },
  })
 