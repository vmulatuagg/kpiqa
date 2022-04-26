<template>
  <div id="app">
    <div class="parent">
        <div class="leftbar" v-if="menuToggle">
            <div class="title hidden">
                <!-- <span>Vanguard KPI</span> -->
                <img src="./assets/super.png"/>
            </div>
            <div class="header mobile">
                <!-- <span>Menu</span> -->
                <div class="bars mobile" v-on:click="menuToggle = false">
                    <span>X</span>
                </div>
            </div>
            <ul>
                <li :class="{'active' : menu == 'home'}" v-on:click="updateMenu('home')">
                    <span>
                        <!-- <i class="bi bi-activity"></i> -->
                        Home
                    </span>
                </li>
                <li :class="{'active' : menu == 'report'}" v-on:click="updateMenu('report')">
                    <span>Reports</span>
                </li>
                <li :class="{'active' : menu == 'milestone'}" v-on:click="updateMenu('milestone')">
                    <span>Milestone</span>
                </li>
                <li :class="{'active' : menu == 'monthly'}" v-on:click="updateMenu('monthly')">
                    <span>Monthly</span>
                </li>
                <li :class="{'active' : menu == 'employee'}" v-on:click="updateMenu('employee')">
                    <span>Team</span>
                </li>
            </ul>
        </div>
        <div class="navbar">
            <div class="bars mobile" v-on:click="menuToggle = true">
                <span>&horbar;</span>
                <span>&horbar;</span>
                <span>&horbar;</span>
            </div>
            <div class="title mobile">
                <span>Super KPI</span>
            </div>
        </div>
        <div class="content">
            <Matrix v-if="menu == 'home'"/>
            <Dashboard v-if="menu == 'report'"/>
            <Home v-if="menu == 'milestone'"/>
            <Employee v-if="menu == 'employee'"/>
            <Month v-if="menu == 'monthly'"/>
        </div>
        <p></p>
    </div>
  </div>
</template>


<script>
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Employee from "./components/Employee";
import Matrix from "./components/Matrix";
import Month from "./components/Month";

export default {
  name: 'App',
  components: { Home, Employee, Month, Dashboard, Matrix },
  mounted(){
        this.$router.push("/login");
        // console.log("WINDOOOOOW", window.location.pathname)
        window.addEventListener("resize", this.handler);
        // this.menuToggle = false;
    },
    data(){
        return {
            menu: "home",
            menuToggle: true,
        }
    },
    methods: {
        updateMenu(elem){
            if(elem != this.menu){
                this.menu = elem;
                // this.menuToggle = false;
            }
        },
        handler(e){
            if(e.target.innerWidth > 768){
                this.menuToggle = true;
            }
            else{
                this.menuToggle = false;
            }
        }
    }
}
</script>

<style lang="scss">
@import "./assets/styles/global.scss";
@font-face {   
    font-family: 'Roboto';    //This is what we are going to call
    src: url("./assets/fonts/Roboto/Roboto-Medium.ttf");
}
body{
  font-family: Roboto;  
}
#app {
  font-family: Roboto, Helvetica, Arial, sans-serif;
}
</style>
