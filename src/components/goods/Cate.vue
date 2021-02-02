<template>
  <div>
    <!-- <h2>商品分类</h2> -->
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog()"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :expand-type="false"
        :selection-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 使用自定义模板渲染 -->
        <template slot="isok" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
            style="color: lightgreen"
          ></i>
          <i v-else class="el-icon-error" style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag type="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            v-else-if="scope.row.cat_level === 1"
            size="mini"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editCate(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalGoods"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="30%"
    >
      <el-form
        :model="addCateForm"
        :rules="addCaterules"
        ref="addCateForm"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedParentCateList"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
            }"
            clearable
            change-on-select
            @change="parentCateChanged()"
          ></el-cascader
        ></el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCatedialogVisible"
      width="30%"
    >
      <el-input v-model="editCateData.cat_name"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sumitEditCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类数据列表，默认为空
      cateList: [],
      totalGoods: 0, //商品分类总数据条数
      //分页设置
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //添加分类的表单数据对象
      addCateForm: {
        cat_name: "", //添加分类的名称
        cat_pid: 0, //父级分类id
        cat_level: 0, //分类等级默认是一级分类
      }, //存储添加分类
      addCatedialogVisible: false, //控制添加分类对话框
      //table指定列
      //添加分类校验规则
      parentCateList: [], //父级分类列表
      selectedParentCateList: [], //选中的父级分类Id数据
      editCateData: {
        //需要编辑的分类id
        cat_id: 0,
        cat_name: "",
      },
      addCaterules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称",
            trigger: "blur",
          },
        ],
      },
      editCatedialogVisible: false,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //将该列定义为模板列
          type: "template",
          //当前列使用的模板名称
          template: "isok",
        },
        {
          label: "排序",
          //将该列定义为模板列
          type: "template",
          //当前列使用的模板名称
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
    };
  },
  methods: {
    async getCateList() {
      //获取商品分类列表
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败");
      this.cateList = res.data.result;
      this.totalGoods = res.data.total;
    },
    //监听pageSize改变时间
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 箭头页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    //显示添加分类弹框
    async showAddCateDialog() {
      // 获取1级2级分类列表
      const { data: res } = await this.$http.get("categories", {
        params: {
          type: 2,
        },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类列表失败");
      }
      this.parentCateList = res.data;
      this.addCatedialogVisible = true;
    },
    parentCateChanged() {
      //监听选择框的变化
      if (this.selectedParentCateList.length > 0) {
        this.addCateForm.cat_pid = this.selectedParentCateList[
          this.selectedParentCateList.length - 1
        ];
        this.addCateForm.cat_level = this.selectedParentCateList.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    //提交确认添加分类
    addCate() {
      // console.log(this.addCateForm);
      this.$refs.addCateForm.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.$message.success("添加分类成功");
        this.getCateList();
        this.clearAddCateForm();
        this.addCatedialogVisible = false;
      });
    },
    //清空添加分类表单方法
    clearAddCateForm() {
      this.$refs.addCateForm.resetFields();
      this.selectedParentCateList = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    //编辑分类名称
    editCate(cate) {
      this.editCatedialogVisible = true;
      this.editCateData.cat_id = cate.cat_id;
      this.editCateData.cat_name = cate.cat_name;
    },
    async sumitEditCate() {
      if (!this.editCateData.cat_name) return this.$message.error("输入错误");
      const {
        data: res,
      } = await this.$http.put(`categories/${this.editCateData.cat_id}`, {
        cat_name: this.editCateData.cat_name,
      });
      // console.log(res);
      if (res.meta.status !== 200)
        return this.$message.errpr("提交编辑分类失败");
      this.$message.success("更改分类名称成功");
      this.getCateList();
      this.editCatedialogVisible = false;
    },
    deleteCate(cate_id) {
      //根据id删除分类
      this.$confirm("此操作将永久删除该分类, 请谨慎操作?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then( async() => {
            const {data:res} = await this.$http.delete(`categories/${cate_id}`);
            if(res.meta.status !==200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            this.getCateList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
  created() {
    this.getCateList();
  },
};
</script>

<style scope>
.zk-table {
  margin-top: 20px;
}
.el-cascader {
  width: 100%;
}
</style>