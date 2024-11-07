<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import { auth } from '../firebase/firebase.js';
import { signOut} from 'firebase/auth';
import { useDisplay } from 'vuetify';
import EditInformation from '@/components/EditInformation.vue';

const { smAndDown, mdAndUp } = useDisplay();
const router = useRouter();
const currentRoute = useRoute();
const showEditInformationDialog = ref(false);
const authStore = useAuthStore();
authStore.fetchCurrentUser();
const unauthorizedSnackbar = ref(false);

if (!authStore.isAuthenticated() || authStore.userRole !== 'staff') {
  unauthorizedSnackbar.value = true;
}

function logout() {
  signOut(auth);
  authStore.clearUser();
  router.push('/staff/login');
}

function back() {
  router.back();
}

</script>

<template>
  <v-app>
    <v-app-bar app color="white" elevation="1">
      <template v-slot:prepend v-if="currentRoute.path != '/staff' && currentRoute.path != '/staff/login'">
        <v-icon @click="back" icon="mdi-chevron-left" style="padding-left: 10px"></v-icon>
      </template>
      <v-app-bar-title
      class="appBar-title"
      @click="() => router.push('/staff')"
      >
      <img src="../assets/chair-svgrepo-com.svg" alt="chair" style="height: 2rem; margin-right: 0.25rem;"/>
      Seated
      </v-app-bar-title>
      <v-spacer />
      <template v-slot:append>
        <div v-if="authStore.userRole == 'staff' && currentRoute.path != '/staff/login' && mdAndUp">
          <v-btn text @click="showEditInformationDialog = true">
            <v-icon>mdi-account-edit</v-icon>
            Edit Information
          </v-btn>
          <v-btn text  @click="logout">
            <v-icon>mdi-logout</v-icon>
            Logout
          </v-btn>
        </div>
        <div v-else-if="authStore.userRole == 'staff' && currentRoute.path != '/staff/login' && smAndDown">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
            </template>
            <v-list>
              <v-list-item @click="showEditInformationDialog = true">
                <template v-slot:prepend>
                  <v-icon>mdi-account-edit</v-icon>
                </template>
                <v-list-item-title>Edit Information</v-list-item-title>
              </v-list-item>
              <v-list-item @click="logout">
                <template v-slot:prepend>
                  <v-icon>mdi-logout</v-icon>
                </template>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />

      <v-dialog v-model="showEditInformationDialog" max-width="500px" transition="dialog-top-transition">
        <EditInformation @close="showEditInformationDialog = false"/>
      </v-dialog>
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
