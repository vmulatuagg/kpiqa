// package
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// pages
import App from './App.vue'
import NotFound from './components/NotFound.vue';
import Login from './components/Login.vue';
// import Home from './components/Home.vue';

// assets
import 'mdb-vue-ui-kit/css/mdb.min.css';
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


Vue.config.productionTip = false
Vue.use(firestorePlugin)
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

// const routes = {
//   '/': App,
//   '/home': Home,
//   '/employee': Employee,
// }


const routes = [
  {
    path: '/',
    component: App,
    props: {
      page: 'home'
    }
  },
  // {
  //   path: '/home',
  //   component: Home,
  //   props: {
  //     page: 'home'
  //   }
  // },
  // {
  //   path: '/home',
  //   component: App,
  //   props: {
  //     page: 'home'
  //   }
  // },
  {
    path: '/employee',
    component: App,
    props: {
      page: 'employee'
    }
  },
  {
    path: '/login',
    component: Login,
    props: {
      page: 'login'
    }
  }
]

new Vue({
  data: {
    currentRoute: window.location.pathname
  },
  mounted(){
    console.log("AANNJAAYY");
  },
  computed: {
    ViewComponent () {
      return routes.find(i => i.path == this.currentRoute).component || NotFound
    }
  },
  render (h) { return h(this.ViewComponent) }
}).$mount('#app')
