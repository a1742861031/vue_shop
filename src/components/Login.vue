<template>
  <div class="login_container">
    <el-form
      :model="loginForm2"
      :rules="loginRule"
      status-icon
      ref="loginForm2"
      label-position="left"
      label-width="0px"
      class="demo-ruleForm login-page"
    >
      <!-- :rules="rules2"绑定验证规则集 -->
      <h3 class="main_title">电商后台管理系统系统</h3>
      <h4 class="second_title"></h4>
      <el-form-item prop="username">
        <!-- 这里的prop="username"是用来绑定表单验证规则的 -->
        <el-input
          type="text"
          v-model="loginForm2.username"
          auto-complete="off"
          placeholder="用户名"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          v-model="loginForm2.password"
          auto-complete="off"
          placeholder="密码"
        ></el-input>
      </el-form-item>
      <el-checkbox v-model="checked" class="rememberme">记住密码</el-checkbox>
      <el-form-item style="width: 100%">
        <el-button
          type="primary"
          style="width: 100%"
          @click="handleSubmit"
          :loading="logining"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      logining: false,
      loginForm2: {
        username: "admin",
        password: "123456",
      },
      loginRule: {
        //验证用户名是否合法
        username: [{ required: true, message: "请输入账号", trigger: "blur" }],
        //验证密码是否合法
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
      checked: false,
    };
  },
  methods: {
    //表单提交，登录
    handleSubmit(event) {
      this.$refs.loginForm2.validate(async (valid) => {
        // console.log(valid)
        if (valid) {
          const { data: res } = await this.$http.post("login", this.loginForm2); //解构赋值data属性 并将赋值给res
          console.log(res);
          //登录失败
          if (res.meta.status !== 200) {
            if (res.meta.msg === "密码错误")
              return this.$message.error("密码错误，请重新输入");
            else if (res.meta.msg === "用户名不存在")
              return this.$message.error("用户名不存在");
            else return false;
          }
          //登录成功后通过sessionStorage保存token,并跳转路由，sessionStorage在浏览器打开期间存在，若关闭则删除
          this.$message.success("登录成功");
          sessionStorage.setItem('token',res.data.token);
          this.$router.push('/home');
        } else { //输入错误
          return false;
        }
      });
    },
    resetForm(formName) {
      //表单重置方法
      this.$refs[formName].resetFields();
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: lightblue;
  background-size: 100% 100%;
}
.login-page {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  width: 350px;
  padding: 35px 35px 15px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
label.el-checkbox.rememberme {
  margin: 0px 0px 15px;
  text-align: left;
}
.main_title {
  margin: 0 auto;
  text-align: center;
}
</style>
             