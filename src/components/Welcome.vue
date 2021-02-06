<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }" >首页</el-breadcrumb-item>
      <el-breadcrumb-item >个人中心</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row>
      <el-col :span="7" class="form1">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div class="avatar">
            <el-avatar
              shape="square"
              :size="100"
              fit="contain"
              src="https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1377979781,1331210068&fm=26&gp=0.jpg"
            ></el-avatar>
          </div>
          <ul class="list-group">
            <li class="list-group-item el-icon-user-solid">
              用户名称：
              <div class="pull-right">{{ userInfo.username }}</div>
            </li>
            <br />
            <li class="list-group-item el-icon-phone">
              电话号码：
              <div class="pull-right">{{ userInfo.mobile }}</div>
            </li>
            <br />
            <li class="list-group-item el-icon-chat-dot-round">
              邮箱地址：
              <div class="pull-right">{{ userInfo.email }}</div>
            </li>
            <br />
            <li class="list-group-item el-icon-info">所属角色<div class="pull-right">{{ rolename}}</div></li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="15" class="form2" >
        <el-card>
          <div id="main" style="width: 600px; height: 388px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from "echarts";
import _ from 'lodash';
export default {
  data() {
    return {
      userInfo: {}, //存储用户信息
      rolename: "",
      options: { //echarts默认配置
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  },
  methods: {
    async getUserInfo() {
      //获取登录的用户信息
      const { data: res } = await this.$http.get(
        `users/${sessionStorage.getItem("userid")}`
      );
      this.userInfo = res.data;
      // console.log(this.userInfo);
      this.getRoleName();
    },
    //获取角色名
    async getRoleName() {
      if(this.userInfo.rid ===0){
        this.rolename = "超级管理员"
      }
      else{
      const { data: res } = await this.$http.get(`roles/${this.userInfo.rid}`);
      this.rolename = res.data.roleName
      }
    },
  },

  created() {
    this.getUserInfo();
  },
   async mounted() {
    //Dom渲染完成后再初始化echarts图表
    var myChart = echarts.init(document.getElementById("main"));
    //
    const { data: res } = await this.$http.get("reports/type/1");
    console.log(res);
    if (res.meta.status !== 200) return this.$message.error("获取图表失败");
    //console.log(res.data);
    const result = _.merge(res.data,this.options)
    myChart.setOption(result);
  },
};
</script>

<style style lang="less" scoped>
.form1 {
  margin-right: 60px;
}
.clearfix {
  display: table;
  content: "";
}
.list-group {
  padding-left: 0;
  list-style: none;
}
.list-group-item {
  width: 100%;
  border-bottom: 1px solid #e7eaec;
  margin-bottom: 10px;
  padding: 11px 0;
  font-size: 15px;
}
.avatar {
  text-align: center;
  border-bottom: 1px solid #e7eaec;
}
.pull-right {
  float: right !important;
}
</style>