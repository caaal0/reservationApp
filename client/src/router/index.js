/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '../stores/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

// Modify routes to set layout based on path pattern
const updatedRoutes = routes.map((route) => {
  if (route.path.startsWith('/admin')) {
    route.meta = { layout: 'admin', requiresAuth: true, role: 'admin' } // Set meta for layout, auth, and role
  } else if (route.path.startsWith('/staff')) {
    route.meta = { layout: 'staff', requiresAuth: true, role: 'staff' }
  } else {
    route.meta = { layout: 'default' }
  }
  return route
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(updatedRoutes),
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  authStore.fetchCurrentUser();
  const user = authStore.user;
  // console.log('User currently logged in:', user);
  // console.log('User role: ', authStore.userRole);

  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    if (!user) {
      // Dynamically redirect to the correct login page based on the route's path
      const loginPath = to.path.startsWith('/admin') ? '/admin/login' : '/staff/login';
      if (to.path !== loginPath) {
        return next(loginPath); // Redirect to the appropriate login if not authenticated
      } else {
        return next(); // Continue if already on the login page
      }
    }

    // const userRole = authStore.userRole;

    // If the route requires a specific role and the user doesn't match, redirect
    if (to.meta.role && to.meta.role !== authStore.userRole) {
      alert('Unauthorized access');
      const unauthorizedPath = to.path.startsWith('/admin') ? '/admin/login' : '/staff/login';
      return next(unauthorizedPath); // Redirect unauthorized users
    } else {
      return next(); // Proceed if the user is authenticated and authorized
    }
  }

  // Proceed to the next route if everything is fine
  next();
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
