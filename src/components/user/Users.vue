<template>
  <div>
    <!-- 用户列表组件 -->
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="30">
        <el-col :span="7">
          <el-input placeholder="搜索" class="input-with-select" v-model="queryInfo.query" clearable
            @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="用户名" prop="username"> </el-table-column>
        <el-table-column label="邮箱" prop="email"> </el-table-column>
        <el-table-column label="电话" prop="mobile"> </el-table-column>
        <el-table-column label="角色" prop="role_name"> </el-table-column>
        <el-table-column label="状态">
          <!-- 通过作用域插槽得到当前这一列的数据 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949"
              @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改角色按钮 -->
            <el-tooltip class="item" effect="dark" content="修改" placement="top">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">
              </el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip class="item" effect="dark" content="删除" placement="top">
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="设置权限" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
      <!-- 添加用户对话框 -->
    </el-card>
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="40%">
      <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>


        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>


        <el-form-item label="确认密码" prop="checkPass">
          <el-input v-model="surePassword" type="password"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearAddForm('addFormRef')">重 置</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="40%" @close="editDialogClose()">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = !editDialogVisible">重 置</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      //密码确认校验规则
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请确认密码'))
        } else if (this.surePassword !== this.addForm.password) {
          console.log(this.surePassword)
          callback(new Error('两次输入密码不一致'))
        } else callback();
      }
      var checkEmail = (rule, value, callback) => { //邮箱验证
        const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/; //邮箱验证正则
        if (regEmail.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法邮箱'))
      }
      var checkPhone = (rule, value, callback) => { //手机号
        const regPhone = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
        if (regPhone.test(value)) {
          return callback();
        }
        callback(new Error('请输入合法手机号'))
      }
      return {
        //获取用户列表参数
        //一些分页的参数，分页的功能在后端实现的
        queryInfo: {
          //请求参数，可不填
          query: "",
          //当前的页数
          pagenum: 1,
          //每一页有多少项
          pagesize: 5,
        },
        userList: [],
        total: 0,
        //添加用户对话框弹出
        addDialogVisible: false,
        surePassword: '',
        editDialogVisible: false, //控制修改用户对话框弹出
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        }, //添加用户表单数据
        editForm: {}, //详细用户信息
        addFormrules: {
          username: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }, {
            min: 3,
            max: 10,
            message: '用户名长度在3-10个字符之间',
            trigger: 'blur'
          }],
          password: [{
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }, {
            min: 6,
            max: 15,
            message: '用户名长度在6-15个字符之间',
            trigger: 'blur'
          }],
          mobile: [{
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          }, {
            validator: checkPhone,
            trigger: 'blur'
          }],
          email: [{
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          }, {
            validator: checkEmail,
            trigger: 'blur'
          }],
          checkPass: [{
            validator: validatePass,
            trigger: 'blur'
          }]
        }, //表单验证规则对象
        editFormRules: {
          email: [{
            required: true,
            message: '请输入用户邮箱',
            trigger: 'blur'
          }, {
            validator: checkEmail,
            trigger: blur
          }],
          mobile: [{
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          }, {
            validator: checkPhone,
            trigger: 'blur'
          }]
        } //修改表单验证规则
      };
    },
    methods: {
      //获取用户参数
      async getUserList() {
        const {
          data: res
        } = await this.$http.get("users", {
          params: this.queryInfo,
        });
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("获取用户列表失败");
        }
        this.userList = res.data.users;
        this.total = res.data.total;
      },
      //监听pageSize改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getUserList();
      },
      //监听页码值改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getUserList();
      },
      //用户状态改变
      async userStateChanged(userInfo) {
        const {
          data: res
        } = await this.$http.put(
          `users/${userInfo.id}/state/${userInfo.mg_state}`
        );
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state;
          return this.$message.error("更新用户状态失败");
        }
        this.$message.success("更新用户状态成功");
      },
      clearAddForm(formName) {
        this.$refs[formName].resetFields();
      },
      //添加用户
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return false
          const {
            data: res
          } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          this.addDialogVisible = false //隐藏添加用户对话框
          this.getUserList() //重新渲染表格
        })
      },
      //展示编辑用户对话框
      async showEditDialog(id) {
        this.editDialogVisible = true;
        // console.log(id);
        //根据id查询用户
        const {
          data: res
        } = await this.$http.get(`users/${id}`);
        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败')
        }
        this.editForm = res.data
      },
      editDialogClose(){//修改用户对话框关闭
        this.$refs.editFormRef.resetFields()
      },
      editUser(id){ //提交修改
         this.$refs.editFormRef.validate(async valid=>{
           if(!valid) return 
           //提交用户修改
           const {data:res} = await this.$http.put(`users/${this.editForm.id}`,{
              email:this.editForm.email,
              mobile:this.editForm.mobile
           })
           if(res.meta.status!==200) return this.$message.error('更新用户信息失败')
           //关闭对话框
           this.editDialogVisible = false;
           //刷新数据列表
           this.getUserList()
           //提示修改成功
           this.$message.success('修改用户信息成功')
         }) 
      }
    },

    created() {
      this.getUserList();
    },
  };

</script>

<style>

</style>
