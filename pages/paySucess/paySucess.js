Page({
  data: {

  },
  goHome(){
    wx.reLaunch({
      url: '/pages/home/home',
    })
  },
  goOrderlist() {
    wx.navigateTo({
      url: '/pages/orderList/orderList',
    })
  }
})