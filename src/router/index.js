import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/components/Login.vue";
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: "/",
    component: Login
  },
  {
    path: "/login",
    component: Login,
    name: "Login"
  },
  {
    path: '/profile/:id',
    name: 'profile', //<-change back to this after test

    /*path: '/profile',
    name: "profile",*/ //<test code
    component: ()=> import('@/views/ProfileView.vue')
  },
  {
    path: '/search/',
    name: 'search',
    component: ()=> import('@/views/SearchView.vue')
  },
    
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from) => {
  if (
    // make sure the user is authenticated
    sessionStorage.getItem("username") === null && to.name !== 'Login'
  ) {
    // redirect the user to the login page
    return { name: 'Login' }
  }
})

export default router
