// components/navbar/index.js
const App = getApp();

Component({
  options: {
    addGlobalClass: true,
  },
  externalClasses: ['custom-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    userName: String,
    countNumber: {
      type: String,
      observer(newVal, oldVal) {
        this.setData({
          countNumber: newVal
        })
      }
    },
    showNav: {
      type: Boolean,
      value: true
    },
    bgColor: {
      type: String,
      value: 'rgba(255,255,255,0)'
    },
    iconColor: {
      type: String,
      value: '#000'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    countNumber: 0,
    navHeight: wx.getStorageSync('navHeight'),
    navTop: wx.getStorageSync('navTop')
    
  },
  lifetimes: {
    attached: function () {
      this.setData({
        navHeight: wx.getStorageSync('navHeight'),
        navTop: wx.getStorageSync('navTop')
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    goCommunity() {
      wx.switchTab({
        url: '/pages/community/community',
      })
    },
    //回退
    _navBack: function () {
      wx.navigateBack({
        delta: 1
      })
    },
    //回主页
    _toIndex: function () {
      wx.switchTab({
        url: '/pages/tabBar/index/index'
      })
    },
  }
})
