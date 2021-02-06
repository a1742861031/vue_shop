<template>
  <div>
    <!-- <h1>商品订单</h1> -->
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="搜索订单"
            clearable
            @clear="resume()"
            v-model="queryInfo.query"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price">
          <!-- <el-tag type="success" v-if="scope.row.order_pay===1">已付款{{scope.row}}</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag> -->
        </el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === 1"
              >已付款{{ scope.row }}</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="update_time">
          <template slot-scope="scope">
            {{ scope.row.update_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-button
            size="mini"
            icon="el-icon-edit"
            type="primary"
            @click="showBox()"
          ></el-button>
          <el-button
            size="mini"
            icon="el-icon-location"
            type="success"
            @click="showProgressBox()"
          ></el-button>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="showBoxDialogVisible"
      width="30%"
      @close="addressDialogCloseed()"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{
              label: 'label',
              value: 'value',
              children: 'children',
            }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showBoxDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sumitAddressForm()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="物流进度"
      :visible.sync="showProgressDialogVisible"
      width="30%"
    >
      <el-timeline >
        <el-timeline-item
          v-for="(progress, index) in progressInfo"
          :key="index"
          :timestamp="progress.time"
            :color="progress.color"
        >
          {{ progress.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showProgressDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "../../assets/js/cityData";
import res from "../../assets/js/progressData";
export default {
  data() {
    return {
      queryInfo: {
        query: "", //查询条件
        pagenum: 1, //页数
        pagesize: 10, //商品条数
      },
      orderList: [], //订单数据
      total: 0, //总订单条数
      showBoxDialogVisible: false, //修改地址对话框
      cityData: cityData,
      res: res, //订单数据
      showProgressDialogVisible: false, //控制物流进度对话框显示
      progressInfo: [], //存储订单数据
      addressForm: {
        address1: [],
        address2: "",
      }, //提交修改地址表单

      addressFormRules: {
        address1: [
          {
            required: true,
            message: "请选择省市区、县",
            trigger: "blur",
          },
        ],
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    async getOrderList() {
      //获取订单
      const { data: res } = await this.$http.get("/orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取订单数据失败");
      //console.log(res.data);
      this.orderList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(pagesize) {
      //每页条数变化
      this.queryInfo.pagesize = pagesize;
      this.gerOrderList();
    },
    handleCurrentChange(pagenum) {
      //页数发送变化
      this.queryInfo.pagenum = pagenum;
      this.getOrderList();
    },
    showBox() {
      //弹出编辑对话框
      this.showBoxDialogVisible = true;
    },
    // handleChange() {
    //   //级联选择器变化
    // },
    addressDialogCloseed() {
      this.$refs.addressFormRef.resetFields();
    },
    sumitAddressForm() {
      this.$refs.addressFormRef.validate((valid) => {
        if (valid) {
          this.showBoxDialogVisible = false;
          this.$message.success("修改地址成功");
        } else {
          this.$message.error("请正确填写");
        }
      });
      // console.log(this.addressForm);
    },
    showProgressBox() {
      //获取物流进度
      if (this.res.meta.status !== 200) this.$message.error("获取物流进度失败");
      this.progressInfo = this.res.data;
      
      if(this.progressInfo[0].context.indexOf('已签收')!==-1)
        this.progressInfo[0].color = "#0bbd87"
      this.showProgressDialogVisible = true;
    },
  },
  created() {
    this.getOrderList();
  },
};
</script>

<style  scoped>
.el-cascader {
  width: 100%;
}
</style>>
