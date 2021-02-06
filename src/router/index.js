import Vue from 'vue'
import Router from 'vue-router'
//通过路由懒加载
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
const Users = () => import(/* webpackChunkName: "users_rights_power" */ '../components/user/Users.vue')
const Right= () => import(/* webpackChunkName: "users_rights_power" */ '../components/power/Rights.vue')
const Params= () => import(/* webpackChunkName: "users_rights_power" */ '../components/goods/Params.vue')

const Roles= () => import(/* webpackChunkName: "users_rights_power" */ '../components/power/Roles.vue')
const Cate= () => import(/* webpackChunkName: "cate_params_goodsList_addGoods" */ '../components/goods/Cate.vue')
const GoodsList= () => import(/* webpackChunkName: "cate_params_goodsList_addGoods" */ '../components/goods/GoodsList.vue')
const AddGoods= () => import(/* webpackChunkName: "cate_params_goodsList_addGoods" */ '../components/goods/AddGoods.vue')
const Order= () => import(/* webpackChunkName: "order_report" */ '../components/order/Orders.vue')
const Report= () => import(/* webpackChunkName: "order_report" */ '../components/report/report.vue')

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/Users.vue'
// import Right from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
// import GoodsList from '../components/goods/GoodsList.vue'
// import AddGoods from '../components/goods/AddGoods.vue'
// import Order from '../components/order/Orders.vue'
// import Report from '../components/report/report.vue'
Vue.use(Router)
const router = new Router({
  routes: [
    //添加重定向
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },   //可以不用配置name属性，用path也可
    {
      path: '/home', component: Home, redirect: '/welcome', children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Right },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList, },
        { path: '/addgoods', component: AddGoods },
        { path: '/orders', component: Order },
        {path:'/reports',component:Report}
      ]
    }
  ]
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to代表将要访问的路径
  //from代表从哪个路径调制而来
  //next()放行
  if (to.path === '/login') {
    return next();
  }
  //获取token
  const tokenStr = sessionStorage.getItem('token');
  if (!tokenStr) {
    return next('/login')
  }
  next();
})
export default router //暴露router