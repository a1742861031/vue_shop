<template>
  <div>
    <!-- <h1>商品列表</h1> -->
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区 -->
    <el-card>
      <el-row>
        <el-col :span="8" class="searchcol">
          <el-input
            placeholder="搜索商品"
            v-model="queryInfo.query"
            clearable
            @clear="resume()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchGoods"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage()"> 添加商品</el-button></el-col
        >
      </el-row>
      <!-- table表格区 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="90px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="90px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="251px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deleteGoods(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        //查询商品的配置信息
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      goodsList: [], //商品列表
      total: 0, //总数据条数
      fullscreenLoading: false, //加载图标显示
    };
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品列表失败");
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      //每页显示条数改变
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      //页数改变
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    async searchGoods() {
      //搜索商品
      const { data: res } = await this.$http.get("goods", {
        params: {
          query: this.queryInfo.query,
          pagenum: 1,
          pagesize: this.total,
        },
      });
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      setTimeout(() => {
        if (res.meta.status !== 200) return this.$message.error("查询失败");
        this.goodsList = res.data.goods;
        this.total = res.data.total;
        loading.close();
      }, 1000);
    },
    resume() {
      this.getGoodsList();
    },
    deleteGoods(row) {
      this.$confirm("此操作将永久删除商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `goods/${row.goods_id}`
          );
          if(res.meta.status!==200) return this.$message.error('删除失败')
          this.$message.success('删除成功');
          this.getGoodsList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    goAddPage(){ //跳转到添加商品页面
        this.$router.push('/addgoods')
    }
  },
  created() {
    this.getGoodsList();
  },
};
</script>

<style scoped>
.searchcol {
  margin-right: 15px;
}
</style>