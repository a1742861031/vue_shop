<template>
  <!-- <h1>添加商品</h1> -->
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区 -->
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>
      <el-steps
        :space="240"
        finish-status="success"
        :active="activeIndex - 0"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-tooltip
                effect="light"
                content="请选择三级分类"
                placement="top-end"
              >
                <el-cascader
                  :options="cateList"
                  :props="{
                    expandTrigger: 'hover',
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children',
                  }"
                  v-model="addForm.goods_cat"
                  @change="handleChange()"
                ></el-cascader>
              </el-tooltip>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  :label="cb"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片上传到的后台服务器地址 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button
              type="primary"
              @click="sumitAddGoods"
              class="sumitAddGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片 -->
    <el-dialog
      title="图片预览"
      :visible.sync="imgPreveiwDialogVisible"
      width="50%"
    >
      <img :src="previewPath" class="preveiwImg" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"; //lodash一般用_
export default {
  data() {
    return {
      activeIndex: "0",
      addForm: {
        //添加商品的表单数据对象
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        //商品详情
        goods_introduce: "",
        attrs: [],
      },
      cateList: [], //商品分类
      manyTableData: [], // 商品的动态参数
      onlyTableData: [], //静态属性
      headerObj: {
        //上传图片的请求头
        Authorization: sessionStorage.getItem("token"),
      },
      previewPath: "",
      imgPreveiwDialogVisible: false, // 预览图片对话框
      addFormRules: {
        //表单验证规则
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
    };
  },

  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败");
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    handleChange() {
      //级联选择器选择发生变化
      if (this.addForm.goods_cat.length !== 3) this.addForm.goods_cat = [];
    },
    beforeTabLeave(activeName, oldactiveName) {
      //切换之前先验证是否选择了商品分类
      // console.log(oldactiveName);
      // console.log(activeName);

      if (oldactiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择三级商品分类");
        return false;
      }
      this.activeSteps = activeName;
    },
    async tabClicked() {
      //单击tab事件
      // console.log(this.activeIndex);
      if (this.activeIndex === "1") {
        //证明访问的是动态参数面板
        const { data: res } = await this.$http.get(
          `categories/${this.addForm.goods_cat[2]}/attributes`,
          {
            params: {
              sel: "many",
            },
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取商品参数失败");
        // console.log(res.data);
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
        console.log(this.manyTableData);
      } else if (this.activeIndex === "2") {
        //访问的是静态属性
        const { data: res } = await this.$http.get(
          `categories/${this.addForm.goods_cat[2]}/attributes`,
          {
            params: {
              sel: "only",
            },
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取商品属性失败");
        this.onlyTableData = res.data;
      } else if (this.activeIndex === "3") {
        //上传图片
      }
    },
    //预览图片事件
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.imgPreveiwDialogVisible = true;
    },
    handleRemove(file) {
      //移除图片
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      this.addForm.pics.splice(i, 1);
      // console.log(this.addForm);
    },
    handleSuccess(response) {
      //监听图片上传成功
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
    },
    sumitAddGoods() {
      //提交添加商品
      // console.log(this.addForm);
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          this.activeIndex = "0";
          return this.$message.error("填写必要表单");
        }
        //处理动态参数和静态属性
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(","),
          };
          this.addForm.attrs.push(newInfo);
        });
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals };
          this.addForm.attrs.push(newInfo);
        });
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = this.addForm.goods_cat.join(","); //将其转换成字符串
        console.log(form);
        //发起请求，注意商品必须是唯一的
        const { data: res } = await this.$http.post("goods", form);
        if (res.meta.status !== 201)
          return this.$message.error(this.res.meta.message);
        this.$message.success("添加商品成功");
        this.$router.push("goods");
      });
    },
  },
};
</script>

<style scope>
.el-checkbox {
  margin: 5px 10px 0 0 !important;
}
.preveiwImg {
  width: 100%;
}
.sumitAddGoods {
  margin-top: 10px;
}
</style>