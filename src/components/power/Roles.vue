<template>
  <div>
    <!-- 角色列表 -->
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 单独一行放列表 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
        <!-- 设置展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 栅格布局 -->
            <el-row
              :class="['dbbottom', i1 === 0 ? 'dbtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item3.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'dbtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
              <!-- 三级权限 -->
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(scope.row)"
              >编辑
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(scope.row)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleVisible" width="500px">
      <el-form :model="addForm" :rules="addFormRules" ref="addForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="sumbitAddRole()">确 定</el-button>
      </div>
      <!-- 编辑角色对话框 -->
    </el-dialog>
    <el-dialog title="编辑角色" :visible.sync="editRoleVisible" width="500px">
      <el-form :model="editForm" :rules="editFormRules" ref="editForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="sumbiteditRole()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="30%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表
      roleList: [],
      addRoleVisible: false, //添加角色对话框显示
      addForm: {
        //添加角色表单
        roleName: "", //角色名称
        roleDesc: "",
      },
      addFormRules: {
        //添加角色校验规则
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
      editRoleVisible: false, //控制修改角色
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
      editForm: {
        roleName: "", //角色名称
        roleDesc: "",
      }, //编辑角色

      setRightDialogVisible: false, //设置分配权限对话框的显示隐藏
      //存储对应角色的所有权限的数据
      rightslist: [],
      treeProps: {
        //属性控件的属性绑定
        label: "authName",
        children: "children",
      },
      defKeys: [], //树默认勾选
      roleId: "",
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    //获取所有角色的列表
    async getRoleList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roleList = res.data;
      console.log(this.roleList);
    },
    async removeRightById(role, rightId) {
      //根据id删除指定权限
      const confirmResult = await this.$confirm(
        "是否删除此角色的该权限?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限失败");
      }
      // this.getRoleList();
      role.children = res.data;
    },
    sumbitAddRole() {
      //提交角色添加
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          for (let i = 0; i < this.roleList.length; i++) {
            if (this.addForm.roleName === this.roleList[i].roleName) {
              return this.$message.error("用户名重复");
            }
          }
          const { data: res } = await this.$http.post("roles", this.addForm);
          if (res.meta.status !== 201)
            return this.$message.error("添加角色失败");
          this.$message.success("添加角色成功");
          this.addRoleVisible = false;
          this.getRoleList();
        }
      });
    },
    //显示编辑角色对话框
    async showEditRoleDialog(role) {
      const { data: res } = await this.$http.get(`roles/${role.id}`);
      this.roleId = role.id;
      this.editForm.roleName = res.data.roleName;
      this.editForm.roleDesc = res.data.roleDesc;
      this.editRoleVisible = true;
    },
    sumbiteditRole() {
      this.$refs.editForm.validate(async (valid) => {
        if (valid) {
          //提交修改角色
          const { data: res } = await this.$http.put(
            `roles/${this.roleId}`,
            this.editForm
          );
          if (res.meta.status !== 200) {
            return this.$message.error("提交编辑角色失败");
          }
          this.$message.success("提交编辑角色成功");
          this.getRoleList();
          this.editRoleVisible = false;
        }
      });
    },
    async deleteRole(role) {
      //根据id删除指定角色
      const confirmResult = await this.$confirm(
        "是否删除此角色?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消删除");
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("成功删除该角色");
      this.getRoleList();
    },
    //展示分配权限对话框
    async showSetRightDialog(role) {
      const { data: res } = await this.$http.get("rights/tree");
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表树失败");
      }
      this.rightslist = res.data; //获取到的权限数据保存到其中
      this.setRightDialogVisible = true;
      //获取所有权限数据
      //获取三级权限id
      this.getLeafKey(role, this.defKeys);
      this.roleId = role.id;
    },
    getLeafKey(node, arr) {
      //获取三级权限的所以id并保存在树中
      if (!node.children) {
        //三级权限不包含children属性
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getLeafKey(item, arr);
      });
    },
    setRightDialogClosed() {
      //关闭分配权限对话框并清空数组
      this.defKeys = [];
    },
    async allotRights() {
      //为角色提交分配权限
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]; //拿到已勾选权限的id
      const idStr = keys.join(","); //将数组转换成字符串，通过,进行拼接
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("更新角色权限失败");
      }
      this.$message.success("更新角色权限成功");
      this.getRoleList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>

<style>
.el-tag {
  margin: 7px;
}

.dbtop {
  border-top: 1px solid #eee;
}

.dbbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
