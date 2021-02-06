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
import TreeTable from 'vue-table-with-tree-grid'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
//导入加载进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'


Vue.config.productionTip = false
Vue.use(VueQuillEditor, /* { default global options } */)
//注册树形表格
Vue.component('tree-table',TreeTable)
//自定义时间过滤器
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  const m = (dt.getMonth()+1+'').padStart(2,'0')
  const d = (dt.getDate()+'').padStart(2,'0')
  const hh = (dt.getHours()+'').padStart(2,'0')
  const mm = (dt.getMinutes()+'').padStart(2,'0')
  const ss = (dt.getSeconds()+'').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/' //本地地址
axios.defaults.baseURL = 'http://42.194.129.172:8888/api/private/v1/' //远端地址

//设置请求拦截器，在发送请求前设置请求头
axios.interceptors.request.use(config=>{
  NProgress.start()
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config=>{
  NProgress.done()
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
 