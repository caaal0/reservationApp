<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import { auth } from '../firebase/firebase.js';
import { signOut} from 'firebase/auth';

const router = useRouter();
const currentRoute = useRoute();
const authStore = useAuthStore();
authStore.fetchCurrentUser();
console.log(currentRoute)
const unauthorizedSnackbar = ref(false);

if (!authStore.isAuthenticated() || authStore.userRole !== 'admin') {
  unauthorizedSnackbar.value = true;
}

function logout() {
  signOut(auth);
  authStore.clearUser();
  router.push('/admin/login');
}

function back() {
  router.back();
}

</script>

<template>
  <v-app>
    <v-app-bar app color="white" elevation="1">
      <template v-slot:prepend v-if="currentRoute.path != '/admin' && currentRoute.path != '/admin/login'">
        <v-icon @click="back" icon="mdi-chevron-left" style="padding-left: 10px"></v-icon>
      </template>
      <v-app-bar-title
      class="appBar-title"
      @click="() => router.push('/admin')"
      >Seated
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn text v-if="authStore.userRole == 'admin'" @click="logout">
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
.appBar-title {
  color: green;
  margin: '0 0.25rem 1rem 0.25rem';
  font-size: 2.25rem;
  font-weight: bold;
  cursor: pointer;
  max-width: fit-content;
  display: inline-block;
}

</style>
