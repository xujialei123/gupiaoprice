<template>
  <div id="app" v-loading="loading">
    深证
    <input type="text" placeholder="添加股票代码" v-model="szdm" @change="addDm('sz','szdm')">
    <br>上证
    <input type="text" placeholder="输入股票代码" v-model="shdm" @change="addDm('sh','shdm')">
    <!-- <ul>
      <li v-for="(item,index) in list" :key="index">
        {{item.name}}<br>
        {{item.price}}<br>
        {{item.reduce}}<br>
        {{item.rate}}<br>
        {{item.dm}}
      </li>
    </ul>-->
    <el-table :data="list" style="width: 100%" @cell-click="cellClick">
      <el-table-column prop="name" label="股票名称"></el-table-column>
      <el-table-column prop="price" label="股价"></el-table-column>
      <el-table-column prop="reduce" label="涨幅"></el-table-column>
      <el-table-column prop="rate" label="比例"></el-table-column>
    </el-table>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
export default {
  data() {
    return {
      loading: false,
      szdm: "",
      shdm: "300033",
      list: [
        {
          dm: "sh600519",
          price: "",
          rate: "",
          reduce: "",
          name: ""
        },
        {
          dm: "sh603568",
          price: "",
          rate: "",
          reduce: "",
          name: ""
        },
        {
          dm: "sh600573",
          price: "",
          rate: "",
          reduce: "",
          name: ""
        }
      ],
      getFlag: false
    };
  },
  name: "App",
  methods: {
    openWindow(dm) {
      window.open(`http://quote.eastmoney.com/${dm}.html`);
    },
    cellClick(row, column, cell, event) {
      if (column.property === "name") {
        this.openWindow(row.dm, "__blank");
      }
    },
    addDm(qz, type) {
      if ((typeof +this[type] !== "number")||!this[type]) {
        return;
      }
      for (let item of this.list) {
        if (item.dm === this[type]) {
          this.$message.warning("已添加此股票");
          return;
        }
      }
      this.loading = true;
      ipcRenderer.send("getInfo", qz + this[type]);
    },
    async getPrice() {
      for (let item of this.list) {
        await new Promise((res, rej) => {
          this.getFlag = true;
          ipcRenderer.send("getInfo", item.dm);
          let timer = setInterval(() => {
            if (!this.getFlag) {
              clearInterval(timer);
              res();
            }
          }, 1000);
        });
      }
    }
  },
  created() {
    if (localStorage.getItem('list')) {
      this.list = JSON.parse(localStorage.getItem('list'))
    }
  },
  mounted() {
    ipcRenderer.on("priceInfo", (e, data) => {
      this.loading = false;
      console.log(data);
      this.getFlag = false
      if (!data.name) {
        return;
      }
      for (let item of this.list) {
        if (item.dm === data.dm) {
          Object.assign(item, data);
          localStorage.setItem('list',JSON.stringify(this.list))
          return;
        }
      }
      this.list.push(data);
      localStorage.setItem('list',JSON.stringify(this.list))
    });
    this.getprice()
    setInterval(() => {
      this.getPrice();
    }, 20000);
  }
};
</script>

<style>
html,
body {
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  /* height: 100% */
}
.el-table__empty-block {
  width: 100% !important;
}
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
  background-color: transparent;
}

/*定义滚动条的轨道，内阴影及圆角*/
::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: transparent;
}

/*定义滑块，内阴影及圆角*/
::-webkit-scrollbar-thumb {
  /*width: 10px;*/
  height: 20px;
  border-radius: 10px;
  background-color: #e9ebee;
}
/*边角，即两个滚动条的交汇处*/

::-webkit-scrollbar-corner {
  /*width: 10px;*/
  background-color: transparent;
}
</style>
