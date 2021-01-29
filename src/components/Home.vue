<<template>
<div>
    <el-button type="info" @click="logout">退出登录</el-button>
</div>  
</template>

<script>
export default {
  methods: {
    logout() {
      //退出登录
      sessionStorage.clear(); //清空token
      this.$router.push("/login"); //回到登录页
    },
  },
};
</script>

<style>
</style>