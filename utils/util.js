// 生产
var httpUrl = 'https://api.ifxj.com/';
const appId = 'wx198a9d9491542fe3'
// 测试
// var httpUrl = 'https://devapi.ifxj.com/';
// const appId = 'wx162ec9f4ada9a659';
var sha256 = require('./sha256.js');
// var uuid = require('./uuid.min.js');
var pako = require('pako');
 const polyfill = require('./base64.js')
 const {atob, btoa} = polyfill;
// 解压后台返回数据
const unzip = (b64Data) => {
    let strData = atob(b64Data),
        charData = strData.split('').map(function(x){return x.charCodeAt(0);}),
        binData = new Uint8Array(charData),
        data = pako.inflate(binData);
    strData = String.fromCharCode.apply(null, new Uint16Array(data));
    return decodeURIComponent(strData)
   }
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const compareVersion = (v1, v2) => {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}
const wxuuid = function () {
  // console.log(uuid())
  var s = [];

  var hexDigits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 51; i++) {

    s[i] = hexDigits.substr(Math.floor(Math.random() * 62), 1);

  }

  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010

  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01

  s[8] = s[13] = s[18] = s[23] = "-";




  var uuid = s.join("").replace("-","");

  return uuid




}
// 网络请求
const request = (url, method, data, msg, succ, fail, com) => {
  var token = wx.getStorageSync('token')
  // 小程序顶部显示Loading
  // wx.showNavigationBarLoading();
  if (msg != "") {
    wx.showLoading({
      title: msg,
      mask: true
    })
  }
  var timestamp = new Date().getTime();
  var nonce = wxuuid();
  var sign = sha256.sha256_digest(timestamp+"IbMSfRBx3QOOAriAYEidUIaRhVe2OzHrjGDnx7KsUttd91QHnKzlR7d6drdq"+nonce)
  wx.request({
    url: httpUrl + url,
    data: data,
    header: {
      'token': token,
      "timestamp": timestamp,
      "nonce": nonce,
      "sign": sign,
      "Accept-Encoding": "gzip"
    },
    method: method,
    success: res => {
      // res = unzip(res)
      if (succ) succ(res);
    },
    fail: err => {
      wx.showToast({
        title: '网络错误，请稍后再试···',
        icon: 'none'
      })
      if (fail) fail(err);
    },
    complete: com => {
      wx.hideNavigationBarLoading();
      if (msg != "") {
        wx.hideLoading();
      }
      if (com.data.errorCode != 0) {
        if (com.data.errorCode == 5001 || com.data.errorCode == 5010) {//重新登录
          // userLogin()
        } else {
          if (com.data.status == 500){
            wx.showToast({
              title: '网络不可用，请稍后重试',
              icon: 'none'
            })
          }else{
            if (url.indexOf('home/points/collect/')>=0){

            }else{
              wx.showToast({
                title: com.data.message,
                icon: 'none'
              })
            }
          }
          
        }
      }
    }
  })
}
const getDay = function(timestamp){
    var getSeconds = '', getMinutes = '', getHours = '';
    var d = new Date(timestamp);
    getHours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
    getMinutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
    getSeconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
    var newTime =  (d.getMonth() + 1) + '-' + d.getDate();
    return newTime
}
const getDaydetail = function(timestamp){
  var getSeconds = '', getMinutes = '', getHours = '';
  var d = new Date(timestamp);
  getHours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
  getMinutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();;
  getSeconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();;
  var newTime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + getHours + ':' + getMinutes + ':' + getSeconds;
  return newTime
}
const userLogin = function () {
  wx.login({
    success(res) {
      if (res.code) {

      }
    },
    fail: function (res) {
    }
  })
}
module.exports = {
  getDaydetail: getDaydetail,
  getDay: getDay,
  formatTime: formatTime,
  compareVersion: compareVersion,
  request: request,
  httpUrl: httpUrl,
  appId: appId
}
