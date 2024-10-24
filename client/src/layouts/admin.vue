<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import { auth } from '../firebase/firebase.js';
import { signOut} from 'firebase/auth';

const isLoggedIn = ref(false);
const router = useRouter();
const authStore = useAuthStore();
authStore.fetchCurrentUser();

const unauthorizedSnackbar = ref(false);

if (!authStore.isAuthenticated() || authStore.userRole !== 'admin') {
  unauthorizedSnackbar.value = true;
}

function logout() {
  signOut(auth);
  authStore.clearUser();
  isLoggedIn.value = false;
  router.push('/admin/login');
}

</script>

<template>
  <v-app>
    <v-app-bar app color="white" elevation="1">
      <v-app-bar-title
      class="appbar-title"
      @click="() => router.push('/admin')"
      >Seated - Admin
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn text v-if="isLoggedIn" @click="logout">
        <v-icon>mdi-logout</v-icon>
        Logout
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-snackbar v-model="unauthorizedSnackbar" color="red">
      Unauthorized user.
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.appbar-title {
  color: green;
  margin: '0 0.25rem 1rem 0.25rem';
  font-size: 2.25rem;
  font-weight: bold;
  cursor: pointer;
  max-width: fit-content;
  display: inline-block;
}
</style>
