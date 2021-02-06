<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
      ></el-alert>
      <!-- 选择分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChange()"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            size="mini"
            type="primary"
            :disabled="buttondisabled"
            @click="addParamsDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTabData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  class="parms_tag"
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 新增参数 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            size="mini"
            type="primary"
            :disabled="buttondisabled"
            @click="addParamsDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态表格 -->
          <el-table :data="onlyTabData" border stripe>
            <el-table-column type="expand">
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    class="parms_tag"
                    v-for="(item, i) in scope.row.attr_vals"
                    :key="i"
                    closable
                    @close="handleClose(i, scope.row)"
                    >{{ item }}</el-tag
                  >
                  <!-- 新增参数 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                    >+
                  </el-button>
                </template>
              </el-table-column></el-table-column
            >
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table></el-tab-pane
        >
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamsDialogVisible"
      width="30%"
      @close="addParamsDialogClose()"
    >
      <el-input :placeholder="titleText" v-model="attr_name"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sumitAddParams()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="eidtParamsDialogVisible"
      width="30%"
    >
      <el-input
        :placeholder="titleText"
        v-model="editForm.attr_name"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="eidtParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sumitEditParams()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [], //商品分类列表
      cateProps: {
        expandTrigger: "hover",
        //级联选择框配置
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      selectedCateKeys: [], //级联选择器选择的数据
      activeName: "many", //存储选择的是哪个tab
      buttondisabled: true, //控制按钮禁用状态
      selectedLastKey: 0, //选择的三级分类id
      //存储动态参数
      manyTabData: [],
      //存储静态属性
      onlyTabData: [],
      addParamsDialogVisible: false, //控制添加参数对话框显示和关闭
      attr_name: "", //要添加的参数名称
      eidtParamsDialogVisible: false, //修改对话框显示与隐藏
      editForm: {
        attr_name: "",
        attrId: "",
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品数据列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.cateList = res.data;
    },
    async getCateParams() {
      //根据所选分类id和所处面板获取对应参数
      const {
        data: res,
      } = await this.$http.get(
        `categories/${this.selectedLastKey}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200)
        return this.$message.error("获取参数列表失败");
      //   console.log(res.data);
      //存储到对应变量中
      res.data.forEach((item) => {
        if (item.attr_vals !== "") item.attr_vals = item.attr_vals.split(" ");
        //返回的参数内容为字符串，并用空格分隔，我们将其转换成功用数组存储
        else item.attr_vals = [];
        //为每一项新增属性，实现新增属性值
        item.inputVisible = false;
        item.inputValue = "";
      });
      // console.log(res.data);
      if (this.activeName === "many") this.manyTabData = res.data;
      if (this.activeName === "only") this.onlyTabData = res.data;
    },
    handleChange() {
      //判断选择的是否为三级分类，如果不是则该选择无效
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.buttondisabled = true;
        this.manyTabData = [];
        this.onlyTabData = [];
        return;
      }
      this.buttondisabled = false;
      this.selectedLastKey = this.selectedCateKeys[
        this.selectedCateKeys.length - 1
      ];
      this.getCateParams();
    },
    handleTabClick() {
      //tab点击处理函数
      this.getCateParams();
    },
    //关闭对话框是情况表单数据
    addParamsDialogClose() {
      this.attr_name = "";
    },
    //提交添加参数\

    async sumitAddParams() {
      if (this.attr_name === "") return this.$message.error("添加参数不能为空");
      const { data: res } = await this.$http.post(
        `categories/${this.selectedLastKey}/attributes`,
        {
          attr_name: this.attr_name,
          attr_sel: this.activeName,
        }
      );
      if (res.meta.status !== 201)
        return this.$message.error("提交添加参数失败");
      this.$message.success("添加参数成功");
      this.addParamsDialogVisible = false;
      this.getCateParams();
    },
    //展示修改按钮对话框
    showEditDialog(data) {
      this.eidtParamsDialogVisible = true;
      this.editForm.attr_name = data.attr_name;
      this.editForm.attrId = data.attr_id;
    },
    async sumitEditParams() {
      //提交修改
      const { data: res } = await this.$http.put(
        `categories/${this.selectedLastKey}/attributes/${this.editForm.attrId}`,
        {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
        }
      );
      if (res.meta.status !== 200) return this.$message.error("修改失败");
      this.$message.success("修改成功");
      this.getCateParams();
      this.eidtParamsDialogVisible = false;
    },
    deleteParams(params) {
      //删除操作
      this.$confirm(`此操作将永久删除该${this.titleText}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.selectedLastKey}/attributes/${params.attr_id}`
          );
          if (res.meta.status !== 200) return this.$message.error("删除失败");
          this.$message.success("删除成功");
          this.getCateParams();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        //去掉空格
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // console.log( row.attr_vals);
      row.attr_vals.push(row.inputValue.trim());
      //提交参数内容
      await this.$http.put(
        `categories/${this.selectedLastKey}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      row.inputVisible = false;
      row.inputValue = "";
    },
    showInput(row) {
      //点击显示输入框
      row.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    async handleClose(i, row) {
      //删除对应参数可选项
      row.attr_vals.splice(i, 1);
      //提交参数内容
      await this.$http.put(
        `categories/${this.selectedLastKey}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
    },
  },
  computed: {
    titleText() {
      if (this.activeName === "many") return "动态参数";
      return "静态属性";
    },
  },
};
</script>

<style style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.parms_tag {
  margin: 10px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>