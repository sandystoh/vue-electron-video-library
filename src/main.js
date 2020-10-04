import '@fortawesome/fontawesome-free/css/all.css'
import '@/css/style.module.scss'
import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import store from './store'
import ImageFallBack from "@/views/helpers/defaultImgDirective";

require('typeface-fira-sans')

Vue.config.productionTip = false

Vue.directive("image-fall-back", ImageFallBack);
Vue.filter('elapsedTime', function(value) {
  let hours =  parseInt(Math.floor(value / 3600)); 
  let minutes = parseInt(Math.floor((value - (hours * 3600)) / 60)); 
  let seconds= parseInt((value - ((hours * 3600) + (minutes * 60))) % 60); 

  let dHours = (hours > 9 ? hours : '0' + hours);
  let dMins = (minutes > 9 ? minutes : '0' + minutes);
  let dSecs = (seconds > 9 ? seconds : '0' + seconds);

  let elapsedTime = '';
  if(hours > 0) { elapsedTime += dHours + ":"}
  elapsedTime += dMins + ":" + dSecs;
  return elapsedTime;
});

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
