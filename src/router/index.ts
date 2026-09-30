import { createRouter, createWebHistory } from 'vue-router';

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: { render: () => null } },
        { path: '/item/add', component: () => import('../views/sheets/ItemFormSheet.vue') },
        { path: '/item/:id/edit', component: () => import('../views/sheets/ItemFormSheet.vue') },
        { path: '/item/:id/delete', component: () => import('../views/sheets/DeleteAlert.vue') },
        { path: '/item/:id', component: () => import('../views/sheets/ItemDetailSheet.vue') },
        { path: '/categories', component: () => import('../views/sheets/CategoriesSheet.vue') },
    ],
});
