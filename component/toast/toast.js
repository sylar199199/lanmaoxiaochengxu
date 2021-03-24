Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持 
  },
  /** 
   * 私有数据,组件的初始数据 
   * 可用于模版渲染 
   */
  data: { // 弹窗显示控制 
    animationData: {},
    content: '',
    showBox: false
  },
  /**
   * 组件的方法列表 
   */
  methods: {
    /** 
     * 显示toast，定义动画
     */
    showToast(val) {
      this.setData({
        showBox: true
      })
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
      })
      this.animation = animation
      animation.opacity(1).step()
      this.setData({
        animationData: animation.export(),
        content: val,
       
      })
      /**
       * 延时消失
       */
      setTimeout(function () {
        animation.opacity(0).step()
        this.setData({
          animationData: animation.export(),
          showBox: false
        })
      }.bind(this), 3000)
    }
  }
})