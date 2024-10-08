/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

//import main styles
import './assets/main.css'

import { auth } from './firebase/firebase.js'
import { onAuthStateChanged } from 'firebase/auth'

import { useAuthStore } from './stores/auth.js'

const app = createApp(App)

registerPlugins(app)

const authStore = useAuthStore();
authStore.fetchCurrentUser();

app.mount('#app')
