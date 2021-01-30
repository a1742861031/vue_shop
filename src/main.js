// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
//导入字体图标
import './assets/fonts/iconfont.css'
Vue.config.productionTip = false
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//设置请求拦截器，在发送请求前设置请求头
axios.interceptors.request.use(config=>{
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
 