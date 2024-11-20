import { createRouter, createMemoryHistory, createWebHistory } from "vue-router";

import Home from '@/pages/Home.vue';
import SignFilePage from "@/pages/SignFilePage.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: Home,
  },
  {
    path: "/sign",
    name: "sign",
    component: SignFilePage,
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});


export default router;