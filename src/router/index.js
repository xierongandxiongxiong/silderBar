import Vue from 'vue'
import Router from 'vue-router'
import powerTimeSetting from '@/components/powerTimeSetting'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'powerTimeSetting',
      component: powerTimeSetting
    }
  ]
})
