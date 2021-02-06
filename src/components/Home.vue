<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/波波商城.jpg" alt="" class="logo" />
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ username }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="jumpToHome()">个人信息</el-dropdown-item>
            <el-dropdown-item @click.native="logout()"
              >退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <!-- 页面主题 -->
    
    <el-container>
      <!-- 侧边栏 -->
      
      <el-aside :width="flagCollapse?'60px':'200px'">
          <div class="toggle-button" @click="toggleCollapse()">|||</div>
        <el-menu background-color="#e1e6e5" text-color="#409ef" :unique-opened="true" :collapse="flagCollapse" :collapse-transition='false' :router="true" :default-active="activePath"> 
            <!-- 开启路由模式 -->
          <el-submenu
            v-for="item in menulist"
            :key="item.id"
            :index="item.id + ''" 
          >
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item :index="subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState(subItem.path)">
                      <!-- index值作为路由/ -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template></el-menu-item
            >
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体内容 -->
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      //左侧菜单
      menulist: [],
      //图标 每个菜单id对应各图标
      iconObj:{
          125:'iconfont icon-user',
          103:'iconfont icon-tijikongjian',
          101:'iconfont icon-shangpin',
          102:'iconfont icon-danju',
          145:'iconfont icon-baobiao'
      },
      flagCollapse:false,
      //被激活的链接地址
      activePath:'',
    };
  },
  methods: {
    logout() {
      //退出登录
      sessionStorage.clear(); //清空token
      this.$router.push("/login"); //回到登录页
    },
    //得到左侧菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) {
        return this.$message.error("获取菜单失败");
      }
      this.menulist = res.data;
    },
    //侧边栏折叠与展开
    toggleCollapse(){
        this.flagCollapse  = !this.flagCollapse;
    },
    //保存链接激活
    saveNavState(activePath){
        sessionStorage.setItem('activePath',activePath);
        this.activePath = activePath
    },
     jumpToHome(){//跳转到首页
     if( this.$route.path === '/welcome') return
      this.$router.push('/welcome')
  }
  },
  created() {
    this.username = sessionStorage.getItem("username"); //通过得到username
    //得到商城列表
    this.getMenuList();
    this.activePath = sessionStorage.getItem('activePath');//得到session保存的高亮链接
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  height: 100px;
  padding: 0;
}
.el-aside {
  background-color: #e1e6e5;
  .el-menu{
      border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.logo {
  height: 40px;
  margin-top: 10px;
}
.el-dropdown {
  float: right;
  position: relative;
  margin-top: 20px;
  margin-right: 100px;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.toggle-button{
    background-color: #cebec7;
    font-size: 10px;
    line-height: 24px;
    color: #FFF;
    text-align: center;
    letter-spacing: 0.12em;//设置字体间距
    cursor: pointer; //放上变小手
}
</style>