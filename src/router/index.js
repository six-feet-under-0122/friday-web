import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import ChatView from '@/views/ChatView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 未登录会显示登录弹窗，所以还是让它进入页面
    next();
  } else {
    next();
  }
});

export default router;