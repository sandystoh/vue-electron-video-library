import Vue from 'vue'
import VueRouter from 'vue-router'
import Empty from '@/views/Empty.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Empty',
    component: Empty
  },
  {
    path: '/library',
    name: 'Library',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Library.vue')
  }
]

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  routes
})

export default router
