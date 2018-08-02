// 使用严格模式
'use strict';

import 'babel-polyfill';
import Vue from 'vue';
import App from '../components/app/app.vue';
import Modal from '../components/common/modal/index.js';

Vue.prototype.$Modal = Modal;
Vue.component('Modal', Modal);

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
});

