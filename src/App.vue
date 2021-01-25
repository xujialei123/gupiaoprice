<template>
  <div id="app">
    深证<input type="text" placeholder="添加股票代码" v-model="szdm" @change="addDm('sz')"><br>
    上证<input type="text" placeholder="输入股票代码" v-model="shdm" @change="addDm('sh')">
    <ul>
      <li v-for="(item,index) in list" :key="index">
        {{item.name}}<br>
        {{item.price}}<br>
        {{item.reduce}}<br>
        {{item.rate}}<br>
        {{item.dm}}
      </li>
    </ul>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
const { ipcRenderer } = window.require("electron");
export default {
  data() {
    return{
      szdm:'',
      shdm:'300033',
      list:[]
    }
  },
  name: "App",
  methods:{
    addDm(qz) {
      ipcRenderer.send('getInfo',qz+this.szdm)
    }
  },
  components: {
    HelloWorld
  },
  mounted() {
    ipcRenderer.on('priceInfo',(e,data)=>{
      console.log(e,data)
      this.list.push(data)
    })
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
