import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
Vue.use(Router)

const router =  new Router({
  routes: [
    //添加重定向
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },   //可以不用配置name属性，用path也可
    { path: '/home', component: Home }
  ]
})
//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  //to代表将要访问的路径
  //from代表从哪个路径调制而来
  //next()放行
  if(to.path === '/login'){
    return next();
  }
  //获取token
  const tokenStr = sessionStorage.getItem('token');
  if(!tokenStr){
    return next('/login')
  }
  next();
})
export default router //暴露router