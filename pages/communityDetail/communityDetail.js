const util = require('../../utils/util.js');
const App = getApp();
Page({

  data: {
    commentWarm: '喜欢就评论告诉TA',
    inviteUserId: null,
    showAuthorize: false,
    showAuthorizephone: false,
    infotop: null,
    height: '',
    imgs: [],
    heig: null,
    comments: [],
    communityid: '',
    contentdata: null,
    createDate: '',
    headImageUrl: null,
    inputBoxShow: false,
    focusInput: false,
    communitycontent: '',
    parentCommentId: '',
    replyId: '',
    contentCount: '',
    isLike: false,
    userName: '',
    regInfo: null,
    marginTop: null,
    windowHeight: null,
    likeCount: 0,
    shareCount: 0,
    iscare: false,
    userId: '',
    showButton: false,
    status: 1,
    source: '',
    fromsource:'',
    likeicon: '',
    nolikegrey: '',
    addIcon: ''
  },
  onLoad(options) {
    this.setData({
      inputBoxShow: false,
      focusInput: false
    })
    if(options.status){
      this.setData({
        status: options.status
      })
    }
    if(options.source){
      this.setData({
        fromsource: options.source
      })
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
    this.setData({
      communityid: options.communityid,
    })
  },
  // 跳转发布动态
  gorelasedynamics(){
    var communityid = this.data.communityid;
    wx.navigateTo({
      url: '/pages/releasedynamics/releasedynamics?communityid='+communityid,
    })
  },
  // 删除动态弹框
  deletereleadynamics(){
    var that = this;
    wx.showModal({
      title: '删除',
      content: '确定删除这条动态？',
      success: function (sm) {
        if (sm.confirm) {
            // 用户点击了确定 可以调用删除方法了
            that.deleteItem()
          } else if (sm.cancel) {
            
          }
        }
      })
  },
   // 删除动态
  deleteItem(){
    var communityid = this.data.communityid;
    util.request('lanmao/community/post/'+communityid, 'DELETE', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 0) {
        wx.switchTab({
          url: '/pages/personInfo/personInfo'
        })
      }else if(res.data.errorCode == 5001){
        this.onLogin('deleteItem')
      }
    })
  },
  //分享配置
  onShareAppMessage: function() {
    var that = this;
    util.request('lanmao/community/post/'+that.data.communityid+'/share' , 'post', '', '', (res) => {
      if (res.data.errorCode == 0) {
          var shareCount = that.data.shareCount;
          clearTimeout(timer)
          var timer = setTimeout(function(){
            shareCount++;
            that.setData({
              shareCount: shareCount
            },500)
          })
      }else if (res.data.errorCode == 5001){
        that.onLogin();
      }
    })
    var nickName = that.data.contentdata.userNickname;
    if(nickName.length > 2){
      nickName = nickName.substring(0,2)
    }
    if(wx.getStorageSync('userId')){
      var pathstr = `/pages/communityDetail/communityDetail?inviteUserId=` + wx.getStorageSync('userId')+'&communityid='+that.data.communityid+'&inviteType=3';
    }else{
      var pathstr = '/pages/communityDetail/communityDetail?communityid='+that.data.communityid+'&inviteType=3';
      
    }
    return {
      title: "@"+nickName+"发了一篇超赞的动态,快来点赞,超低价兑换盲盒",
      path: pathstr,
      success: function(res){
　　　　　　// 转发成功之后的回调
　　　　　　if(res.errMsg == 'shareAppMessage:ok'){
           
　　　　　　}
　　　　},
    }
},
  onShow(){
    if(wx.getStorageSync('inviteUserId')){
      this.getInfo()
    }
    this.setData({
      inputBoxShow: false,
      focusInput: false,
      addIcon: 'https://oss.ifxj.com/lanmao/health/addIcon420.png?'+Date.parse(new Date()),
      likeicon: 'https://oss.ifxj.com/lanmao/health/like.png?'+Date.parse(new Date()),
      nolikegrey:'https://oss.ifxj.com/lanmao/health/lickgrey.png?'+Date.parse(new Date())
    })
    this.setData({
      marginTop: wx.getStorageSync('navHeight')
    })
    console.log(this.data.marginTop)
    this.setData({
      communityid: this.data.communityid
    })
    if(wx.getStorageSync("loginInfo")){
      var headImageUrl = JSON.parse(wx.getStorageSync("loginInfo")).headImageUrl;
      this.setData({
        headImageUrl: headImageUrl
      })
    }
    var device = wx.getSystemInfoSync();
    this.setData({
      infotop: (device.windowHeight - 390) / 2,
      codeTop: (device.windowHeight - 350) / 2,
      windowHeight: device.windowHeight
    })
    this.getDetail()
  },
  //是否发关注
  getCare(){
    util.request('lanmao/community/user/'+this.data.contentdata.userId+'/isFollow' , 'post', '', '', (res) => {
      if (res.data.errorCode == 0) {
        this.setData({
          iscare: res.data.data,
          showButton: true
        })
        
      }
    })
  },
  care(){
    util.request('lanmao/community/user/'+this.data.contentdata.userId+'/follow' , 'post', '', '', (res) => {
      if (res.data.errorCode == 0) {
        this.setData({
          iscare: true
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
        if (sm.confirm) {
          util.request('lanmao/community/user/'+that.data.contentdata.userId+'/unfollow' , 'post', '', '', (res) => {
            if (res.data.errorCode == 0) {
              that.setData({
                iscare: false
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
  goTopic(){
      wx.navigateTo({
        url: '/pages/topicList/topicList?topicId=' + this.data.contentdata.topicId+"&topicName="+this.data.contentdata.topicName
      })
  },
  //点赞
  dianzan(){
    var likeCount = this.data.likeCount;
    if(!this.data.isLike){
      util.request('lanmao/community/post/'+this.data.communityid+'/like' , 'post', '', '', (res) => {
        if (res.data.errorCode == 0) {
          likeCount++;
          console.log(likeCount)
          this.setData({
            isLike: true,
            likeCount: likeCount
          })
          var obj = {
            isLike: true,
            likeCount: likeCount,
            communityid: this.data.communityid
          }
          wx.setStorageSync('isLikeobj',JSON.stringify(obj));
          
        }else if (res.data.errorCode == 5001){
          this.onLogin('cancleCare');
        }
      })
    }else{
      util.request('lanmao/community/post/'+this.data.communityid+'/unlike' , 'post', '', '', (res) => {
        if (res.data.errorCode == 0) {
          likeCount--;
          this.setData({
            isLike: false,
            likeCount: likeCount
          })
          var obj = {
            isLike: false,
            likeCount: likeCount,
            communityid: this.data.communityid
          }
          wx.setStorageSync('isLikeobj',JSON.stringify(obj));
        }else if (res.data.errorCode == 5001){
          this.onLogin('dianzan');
        }
      })
    }
    
  },
  handleContentInput(e) {
    const value = e.detail.value
    var contentCount = value.length  //计算已输入的正文字数
    this.setData({
      communitycontent: value,
      contentCount: contentCount
    })
  },
  replayCommunity(e){
    if(e.currentTarget.dataset.replyid){
      console.log(e.currentTarget.dataset.usernickname)
      this.setData({
        commentWarm: "回复"+e.currentTarget.dataset.usernickname,
        replyId: e.currentTarget.dataset.replyid,
        communitycontent: this.data.communitycontent,
        parentCommentId: e.currentTarget.dataset.parentcommentid
      })
    }else{
      if(e.currentTarget.dataset.usernickname){
        this.setData({
          commentWarm: "回复"+e.currentTarget.dataset.usernickname,
          communitycontent: this.data.communitycontent,
          parentCommentId: e.currentTarget.dataset.parentcommentid
        })
      }else{
        this.setData({
          commentWarm: "喜欢就评论告诉TA",
          communitycontent: this.data.communitycontent,
          parentCommentId: e.currentTarget.dataset.parentcommentid
        })
      }
     
    }
    this.focusButn('replay')
    
  },
  //发送评论
  sendCommunity(){
    console.log(this.data.communitycontent)
    if(!this.data.communitycontent){
      wx.showToast({
        title: '请输入评论的内容',
        icon: 'none'
      })
      return
    }
    var data = {
      content: this.data.communitycontent,
      parentCommentId: this.data.parentCommentId,
      replyId: this.data.replyId,
      postId: this.data.communityid
    }
    util.request('lanmao/community/post/comment' , 'post', data, '', (res) => {
      if (res.data.errorCode == 0) {
        this.getDetail()
        this.setData({
          replyId: '',
          communitycontent: '',
          parentCommentId: ''
        })
      }else if (res.data.errorCode == 5001){
        this.onLogin('sendCommunity');
      }
    })
  },
  //打开评论弹框
  focusButn(source){
    console.log(source)
    if(source != 'replay'){
      this.setData({
        commentWarm: "喜欢就评论告诉TA",
      })
    }
    this.getInfo(source)
  },
  getInfo(source){
    var that = this;
    util.request('lanmao/mp/user/user/info', 'GET', '', '', (loginres) => {
      wx.hideLoading()
      if (loginres.data.errorCode == 0) {
        wx.setStorageSync('userId', loginres.data.data.id)
        that.setData({
          showAuthorize: false,
        })
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
          if(source){
            that.setData({
              showAuthorizephone: false,
              focusInput: true,
              inputBoxShow: true
            })
          }
        }
      } else if (loginres.data.errorCode == 5001) {
        that.onLogin(source);
      }
    })
  },
  inputFocus: function (e) {
      if(e.detail.height == this.data.height){
        this.setData({
          inputBoxShow: true,
          focusInput: true
        });
      }else{
        this.setData({
          inputBoxShow: true,
          height: e.detail.height,
        });
      }
    },
    inputBlur: function(){
      this.setData({
         inputBoxShow: false,
        //  height: 0
      });
    },
    goUsercenter(e){
      if(e.currentTarget.dataset.userid){
        var userId = e.currentTarget.dataset.userid;
        wx.navigateTo({
          url: '/pages/userCenter/userCenter?userId=' + userId
        })
      }else{
        console.log(this.data.userId)
        wx.navigateTo({
          url: '/pages/userCenter/userCenter?userId=' + this.data.userId
        })
      }
     
    },
  getDetail(){
    util.request('lanmao/community/post/'+this.data.communityid , 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        var shareCount = res.data.data.shareCount;
        var likeCount = res.data.data.likeCount;
        var commentslength = res.data.data.comments.length;
        if(shareCount > 10000){
          shareCount = '1w+'
        }
        if(likeCount > 10000){
          likeCount = '1w+'
        }
        if(commentslength > 10000){
          commentslength = '1w+'
        }
        this.setData({
          commentslength: commentslength,
          imgs: res.data.data.imgs,
          comments: res.data.data.comments,
          contentdata: res.data.data,
          createDate: util.getDay(res.data.data.createDate),
          likeCount: likeCount,
          shareCount: shareCount,
          isLike: res.data.data.liked,
          userId: res.data.data.userId
        })
        this.getCare()
        var title =  res.data.data.createBy;
        wx.setNavigationBarTitle({
          title: title
        })
      }else if (res.data.errorCode == 5001){
        this.onLogin('getDetail');
      }
    })
  },
  //监听组件传来的消息
  onevent(e){
    if(e.detail.source == 'sendCommunity'){
      this.sendCommunity();
    }else if(e.detail.source == 'dianzan'){
      this.dianzan()
    }else if(e.detail.source == 'cancleCare'){
      this.cancleCare()
    }else if(e.detail.source == 'getDetail'){
      this.getDetail()
    }else if(e.detail.source == 'deleteItem'){
      this.deleteItem()
    }else if(e.detail.source == 'focusButn'){
      this.focusButn()
    }
  },
   //监听手机号授权组件传来的消息
   phonevent(e){
    if(!e.detail.showAuthorizephone){
    
    }
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
              if(source == 'sendCommunity'){
                  that.sendCommunity()
              }else if(source == 'dianzan'){
                  that.dianzan()
              }else if(source == 'cancleCare'){
                that.cancleCare()
              }else if(source == 'care'){
                that.care()
              }else if(source == 'getDetail'){
                that.getDetail()
              }else if(source == 'deleteItem'){
                that.deleteItem()
              }else if(source == 'focusButn'){
                that.focusButn()
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
})