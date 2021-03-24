const util = require('../../utils/util.js');
const App = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    freshStatus: 'more', // 当前刷新的状态
    showRefresh: false,   // 是否显示下拉刷新组件
    source: null,
    showAuthorize: false,
    hasMoreData: true,
    page: 1,
    pageSize: 10,
    scrollH: 0,//屏幕高度
    imgWidth: 0,//图片展示宽度
    images: [],
    col1: [],
    col2: [],
    col1H: 0,
    col2H: 0,
    marginTop: null,
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏  
    topicId: '',
    topicName: '',
    likeicon: '',
    nolikegrey: '',
    loadingCount: 0,
    fresh: '',
    publishIcon: 'https://oss.ifxj.com/lanmao/health/publishIcon.png?'+Date.parse(new Date()),
  },
  onShow(){
    this.setData({
      fresh: "https://oss.ifxj.com/lanmao/health/fresh.gif?"+Date.parse(new Date()),
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

  },
  onLoad: function (option) {
    this.setData({
      topicId: option.topicId,
      topicName: option.topicName
    })
    this.setData({
      marginTop: wx.getStorageSync('navHeight')
    })
    wx.setNavigationBarTitle({
      title: "#" +option.topicName
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
          page: 1,
          col1: [],
          images: [],
          col2: [],
          col1H: 0,
          col2H: 0
        })
        //加载首组图片
        this.loadImages();
      }
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
          this.onLogin('goPublish');
        }
      })
    }
  
  },
  clickLike(){
    var direct = this.data.direct;
    var index = this.data.index;
    console.log(direct,index)
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
          console.log(data)
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
        this.onLogin('goPublish');
      }
    })
  },
  //监听组件传来的消息
  onevent(e){
    console.log(e.detail.source)
    if(e.detail.source == 'loadImages'){
      this.loadImages();
    }else if(e.detail.source == 'goPublish'){
      this.goPublish()
    }
  },
  goDetail(e){
    var id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/communityDetail/communityDetail?communityid=' + id
      })
  },
  isregister(e){
    console.log(e.detail.showAuthorize)
    this.setData({
      showAuthorize: true,
      source: 'goPublish'
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
                }else if(soure == 'clickLike'){
                  that.clickLike()
                }else if(soure == 'cancleLike'){
                  that.cancleLike()
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
             }
           }
         } else if (loginres.data.errorCode == 5001) {
           this.onLogin(source);
         }
       })
     },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadImages();
    } else {
     
    }
  },
  loadImages: function () {
    var that = this;
    var page = '',url = '';
      page = that.data.page;
      url = 'lanmao/community/post';
    var data = {
      topicId: this.data.topicId,
      page: page,
      size: that.data.pageSize,
      userId: '',
      status: 1
    }
    util.request(url, 'GET', data, '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
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
 