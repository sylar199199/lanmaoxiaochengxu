const util = require('../../utils/util.js');
// import NavBar from '@/taro-navigationbar';
const App = getApp();
Page({
  data: {
    detailstatus: '',
    back: '',
    topicData: [],
    navHeight: '',
    navTop: '',
    hasPublish: false,
    status: 0,
    titleCount: 0, //标题字数
    contentCount: 0, //正文字数
    title: '', //标题内容
    content: '', //正文内容
    imgs: [],
    placeholder: '请选择',
    multiIndex: [0, 0, 0],
    viewH: '',
    yesorno: 'none',
    flag: true,
    test: 'closePop',
    topicId: '',
    topicName: '选择合适的话题让更多的人看到～ ',
    id: '',
    showbindTime: false,
    time: ''
    
  },
  onLoad(options) {
    if(options.communityid){
      this.setData({
        id: options.communityid
      })
      wx.setNavigationBarTitle({
        title: '编辑动态'
      })
    }else{
      wx.setNavigationBarTitle({
        title: '发布动态'
      })
    }
    this.getTopic()
    // $init(this)
  },
  handlerGobackClick(){},
  onShow(){
    this.banPoststatus()
    this.setData({
      navHeight: wx.getStorageSync('navHeight'),
      navTop: wx.getStorageSync('navTop')
    })
    var navHeight = wx.getStorageSync('navHeight');
    wx.getSystemInfo({  
      success: (res) => {
        this.setData({
          windowWidth: res.windowWidth * (750 / res.windowWidth),
          windowHeight: (res.windowHeight * (750 / res.windowWidth)),
          viewH: (navHeight*navHeight*(750/ res.windowWidth))
        })
      },
    })
  },

  //禁言状态
  banPoststatus(){
    util.request('lanmao/community/user/banPost/status' , 'POST', '', '', (res) => {
      if (res.data.errorCode == 0) {
      console.log(res.data)
      if(res.data.data.banPost){
        this.setData({
          showbindTime: true,
          time: util.getDaydetail(res.data.data.banPostTime)
        })
      }else{
        this.setData({
          showbindTime: false,
          time: ''
        })
      }
        
      }else if (res.data.errorCode == 5001){
        this.onLogin('getDetail');
      }
    })
  },
  //获取动态详情
  getDetail(){
    util.request('lanmao/community/post/'+this.data.id , 'GET', '', '', (res) => {
      if (res.data.errorCode == 0) {
        this.setData({
          detailstatus: res.data.data.status,
          topicName: res.data.data.topicName,
          topicId: res.data.data.topicId,
          title: res.data.data.title,
          content: res.data.data.content,
          isLike: res.data.data.liked,
          userId: res.data.data.userId,
          contentCount: res.data.data.content.length,
          titleCount: res.data.data.title.length
        })
        var img = res.data.data.imgs;
        var imgs = [];
        for(let i in img){
          var obj = {};
          obj.id = img[i].id;
          obj.imgUrl = img[i].imgUrl;
          imgs.push(obj)
        }
        var topicData = this.data.topicData;
        for(let i in topicData){
          if(this.data.topicId == topicData[i].id){
            topicData[i].isSelect = true
          }
        }
        this.setData({
          imgs: imgs,
          topicData: topicData
        })
      }else if (res.data.errorCode == 5001){
        this.onLogin('getDetail');
      }
    })
  },
  //获取话题列表
  getTopic(){
    util.request('lanmao/community/post/topic', 'GET', '', '', (res) => {
      wx.hideLoading()
      if (res.data.errorCode == 5001) {
        this.onLogin('getTopic')
      } else if (res.data.errorCode == 0) {
        var topicData = res.data.data;
        for(let i in topicData){
          topicData[i].point = "#";
          topicData[i].isSelect = false;
        }
        this.setData({
          topicData: topicData
        })
        if(this.data.id){
          this.getDetail()
        }
      }
    })
  },
  getTopiccontent(e){
    var topicData = this.data.topicData;
    for(let i in topicData){
      topicData[i].isSelect = false;
      if(e.currentTarget.dataset.id == topicData[i].id){
        topicData[i].isSelect = true
      }
    }
    this.setData({
      topicId: e.currentTarget.dataset.id,
      topicName: "#"+e.currentTarget.dataset.name,
      topicData: topicData
    })
    clearTimeout(timeer)
    const timeer = setTimeout(()=>{
      this.closePop()
    },200)
    
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
  // 上传图片
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    console.log(imgs)
    if (imgs.length >= 9) {
      this.setData({
        lenMore: 1
      });
      setTimeout(function () {
        that.setData({
          lenMore: 0
        });
      }, 2500);
      wx.showToast({
        title: '上传图片不得超过9张',
        icon: "none"
      })
      return false;
    }
    wx.chooseImage({
      // count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths + '----');
        var imgs = that.data.imgs;
        if (imgs.length >= 9) {
          wx.showToast({
            title: '上传图片不得超过9张',
            icon: "none"
          })
          return false;
        } 
        that.uploadImg(0,tempFilePaths.length,tempFilePaths)
      
      
      }
    });
  },
  uploadImg(i,length,urlData){
    var imgs = this.data.imgs;
    if (imgs.length >= 9) {
      this.setData({
        lenMore: 1
      });
      setTimeout(function () {
        that.setData({
          lenMore: 0
        });
      }, 2500);
      wx.showToast({
        title: '上传图片不得超过9张',
        icon: "none"
      })
      return false;
    }
    wx.showLoading({
      icon: 'none',
      mask: true
    })
    var that = this;
    var imgs = that.data.imgs;
    var token = wx.getStorageSync('token');
    var url = urlData[i];
    wx.uploadFile
      ({
        url: util.httpUrl + 'lanmao/community/post/uploadimg',
        filePath: url,
        name: 'file',
        header: {
          'token': token
        },
        formData: {},
        success(res) {
          var res = JSON.parse(res.data)
          if (res.errorCode == 5001) {
            that.onLogin('',urlData)
          }else{
            console.log(res)
            var obj = {
              id: '',
              imgUrl: res.data
            }
            imgs.push(obj);
            that.setData({
              imgs: imgs
            });
            if(++i<length){
              that.uploadImg(i,length,urlData)
          }
          }
          wx.hideLoading();
        }
      })

  },
  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    });
  },
  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;

    console.log(imgs[index].imgUrl)
    var imgArr = [];
    for(let i in imgs){
      imgArr.push(imgs[i].imgUrl)
    }
    wx.previewImage({
      //当前显示图片
      current: imgArr[index],
      //所有图片
      urls: imgArr,
      fail:function(err){
        console.log(err)
      }
    })
  },
  handleTitleInput(e) {
    const value = e.detail.value.replace(/\s+/g, '');

    var titleCount = value.length  //计算已输入的标题字数
    this.setData({
      titleCount: titleCount,
      title: value
    })
    // $digest(this)
  },

  handleContentInput(e) {
    const value = e.detail.value
    var contentCount = value.length  //计算已输入的正文字数
    this.setData({
      content: value,
      contentCount: contentCount
    })
  },
  onLogin(type,url) {
    var that = this;
    wx.showLoading({
      title: '',
      mask: true
    })
    wx.login({
      success(res) {
        if (res.code) {
          console.log(util.appId)
          var data = {
            code: res.code,
            appid: util.appId
          }
          util.request('lanmao/mp/user/login', 'POST', data, '', (loginres) => {
            wx.hideLoading()
            if (loginres.data.errorCode == 5010) {//重新获取code,弹框授权获取用户信息
            } else if (loginres.data.errorCode == 0) {
              wx.setStorageSync('token', loginres.data.data.token)
              if(url){
                that.uploadImg(0,url.length,url)
              }else if(type == 'publishContent'){
                that.publishContent();
              }else if(type == 'savedraft'){
                that.savedraft();
              }else if(type == 'getTopic'){
                that.getTopic();
              }else if(type == 'getDetail'){
                that.getDetail();
              }
            }
          })
        }
      },
      fail: function (res) {
      }
    })
  },
  //存草稿
  savedraft(e){
    var that = this;
    if(this.data.detailstatus == 1 && this.data.id){
      wx.showToast({
        title: '此动态已发布，不可保存到草稿',
        icon: "none"
      })
      return false;
    }
    if(e){
        var back = e.currentTarget.dataset.back;
        that.setData({
          back: back
        })
      }
        wx.showModal({
            title: '',
            content: '要保存到草稿吗？',
            success: function (sm) {
              if (sm.confirm) {
                that.publishContent('1')
                } else if (sm.cancel) {
                  if(that.data.back){
                    clearTimeout(timer)
                    var timer = setTimeout(() => {
                      wx.switchTab({
                        url: '/pages/personInfo/personInfo',
                      })
                    }, 3000);
                  }
                }
              }
            })
  },
  goback(){
    wx.navigateBack({
      delta: 1
    })
  },
  publishContent(type){
    if(this.data.imgs.length == 0){
      wx.showToast({
        title: '请上传照片',
        mask: true,
        icon: 'none'
      })
      return
    }
    if(!this.data.title){
      wx.showToast({
        title: '请输入标题',
        mask: true,
        icon: 'none'
      })
      return
    }
    if(!this.data.content){
      wx.showToast({
        title: '请输入正文',
        icon: 'none',
        mask: true
      })
      return
    }
    if(!this.data.topicId){
      wx.showToast({
        title: '请选择话题',
        mask: true,
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '',
      mask: true
    })
    var imgs = [],imgUrl = '';
    for(let i in this.data.imgs){
      var obj = {};
      obj.id = this.data.imgs[i].id;
      obj.sort = i;
      obj.imgUrl = this.data.imgs[i].imgUrl;
      imgs.push(obj)
    }
    imgUrl = this.data.imgs[0].imgUrl;
    var imgHeight = '',imgWidth = '';
    var that = this;
    var status = ''
    if(type == '1'){
      status = 0
    }else{
      status = 1
    }
    wx.getImageInfo({
      src: imgUrl,
      success: function (response) {
        imgHeight = response.height;
        imgWidth = response.width;
       
        var data = {
          imgHeight: imgHeight,
          imgWidth: imgWidth,
          title: that.data.title,
          content: that.data.content,
          status: status,
          imgs: imgs,
          imgUrl: imgUrl,
          topicId: that.data.topicId
        }
        console.log(that.data.id)
        if(that.data.id){
          util.request('lanmao/community/post/'+that.data.id, 'POST', data, '', (res) => {
            wx.hideLoading()
            if (res.data.errorCode == 5001) {
              if(type == 1){
                that.onLogin('savedraft')
              }else{
                that.onLogin('publishContent')
              }
              
            } else if (res.data.errorCode == 0) {
              wx.hideLoading();
              that.setData({
                hasPublish: true
              })
              if(type == 1){
                wx.showToast({
                  title: '已保存到草稿',
                  icon: 'none'
                })
                clearTimeout(timer)
                var timer = setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/personInfo/personInfo',
                  })
                }, 3000);
              }else{
                wx.showToast({
                  title: '发布成功',
                  icon: 'none'
                })
              }
              getApp().globalData.source = 'refreshPage';
              wx.switchTab({
                url: '/pages/community/community',
              })
              // wx.navigateBack()
            }
          })
        }else{
          util.request('lanmao/community/post', 'POST', data, '', (res) => {
            wx.hideLoading()
            if (res.data.errorCode == 5001) {
              if(type == 1){
                that.onLogin('savedraft')
              }else{
                that.onLogin('publishContent')
              }
            } else if (res.data.errorCode == 0) {
              wx.hideLoading();
              that.setData({
                hasPublish: true
              })
              if(type == 1){
                wx.showToast({
                  title: '已保存到草稿',
                  icon: 'none'
                })
                clearTimeout(timer)
                var timer = setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/personInfo/personInfo',
                  })
                }, 3000);
              }else{
                wx.showToast({
                  title: '发布成功',
                  icon: 'none'
                })
              }
              getApp().globalData.source = 'refreshPage';
              wx.switchTab({
                url: '/pages/community/community',
              })
            }
          })
        }
      },
      fail: function(err){
        var data = {
          imgHeight: 1200,
          imgWidth: 750,
          title: that.data.title,
          content: that.data.content,
          status: status,
          imgs: imgs,
          imgUrl: imgUrl,
          topicId: that.data.topicId
        }
        if(that.data.id){
          util.request('lanmao/community/post/'+that.data.id, 'POST', data, '', (res) => {
            wx.hideLoading()
            if (res.data.errorCode == 5001) {
              that.onLogin('publishContent')
            } else if (res.data.errorCode == 0) {
              wx.hideLoading();
              that.setData({
                hasPublish: true
              })
              if(type == 1){
                wx.showToast({
                  title: '已保存到草稿',
                  icon: 'none'
                })
                  clearTimeout(timer)
                  var timer = setTimeout(() => {
                    wx.switchTab({
                      url: '/pages/personInfo/personInfo',
                    })
                  }, 3000);
              }else{
                wx.showToast({
                  title: '发布成功',
                  icon: 'none'
                })
              }
              getApp().globalData.source = 'refreshPage';
              wx.switchTab({
                url: '/pages/community/community',
              })
            
            }
          })
        }else{}
        util.request('lanmao/community/post', 'POST', data, '', (res) => {
          wx.hideLoading()
          if (res.data.errorCode == 5001) {
            that.onLogin('publishContent')
          } else if (res.data.errorCode == 0) {
            wx.hideLoading();
            that.setData({
              hasPublish: true
            })
            if(type == 1){
              wx.showToast({
                title: '已保存到草稿',
                icon: 'none'
              })
              clearTimeout(timer)
              var timer = setTimeout(() => {
                wx.switchTab({
                  url: '/pages/personInfo/personInfo',
                })
              }, 3000);
            }else{
              wx.showToast({
                title: '发布成功',
                icon: 'none'
              })
            }
            getApp().globalData.source = 'refreshPage';
            wx.switchTab({
              url: '/pages/community/community',
            })
          
          }
        })
       
      }
    })
    if(!imgHeight || !imgWidth){
      return
    }
    // console.log(imgs)
  },
  onUnload:function(){
    
  }
})