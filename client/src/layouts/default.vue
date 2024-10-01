<template>
  <v-app>

    <v-app-bar app color="transparent" elevation="1">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <!-- <v-app-bar-title class="appbarTitle" >Seated</v-app-bar-title> -->
      <v-toolbar-title
        class="appbarTitle"
        @click="() => router.push('/')"
        >Seated</v-toolbar-title>
      <v-spacer />
      <v-btn text to="/">Home</v-btn>
      <v-btn text @click="showLogin = true">Login</v-btn>
      <v-btn text @click="showSignup = true">Signup</v-btn>
    </v-app-bar>

    <v-navigation-drawer
      floating
      temporary
      v-model="drawer"
    >
      <v-list>
        <v-list-item
          title="Floors"
          :style="{color: 'var(--black)', margin: '2rem 1.5rem 0.5rem 1rem', fontSize: '1.5rem'}"
        ></v-list-item>
        <v-list-item
          title="3rd Floor (Main)"
          prepend-icon="mdi-stairs"
          :style="{color: 'var(--black)', margin: '0 1rem 0 1rem', fontSize: '1.25rem'}"
          to="/"
        ></v-list-item>
        <v-list-item
          title="4th Floor"
          prepend-icon="mdi-stairs"
          :style="{color: 'var(--black)', margin: '0 1rem 0 1rem', fontSize: '1.25rem'}"
          to="/floor4"
        ></v-list-item>
        <v-list-item
          title="2nd Floor"
          prepend-icon="mdi-stairs"
          :style="{color: 'var(--black)', margin: '0 1rem 0 1rem', fontSize: '1.25rem'}"
          to="floor2"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-dialog v-model="showLogin" max-width="500px" transition="dialog-top-transition" persistent>
      <LoginForm @close="showLogin = false" @switch-to-signup="switchToSignup" />
    </v-dialog>

    <v-dialog v-model="showSignup" max-width="500px" transition="dialog-top-transition" persistent>
      <SignupForm @close="showSignup = false" @switch-to-login="switchToLogin" />
    </v-dialog>

    <v-main>
      <router-view />
    </v-main>

    <!-- <AppFooter /> -->
  </v-app>
</template>

<script setup>
  import AppFooter from '@/components/AppFooter.vue';
  import LoginForm from '@/components/LoginForm.vue';
  import SignupForm from '@/components/SignupForm.vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const showLogin = ref(false);
  const showSignup = ref(false);
  const drawer = ref(false);

  function switchToSignup() {
    showLogin.value = false;
    showSignup.value = true;
  }

  function switchToLogin() {
    showSignup.value = false;
    showLogin.value = true;
  }
</script>

<style scoped>
.no-background {
  background-color: transparent !important;
  transition: none !important;
  align-self: center;
}

.no-background:hover {
  background-color: transparent !important;
}

/* Optional: Remove ripple effect if unwanted */
.no-background .v-list-item__ripple {
  display: none;
}

.title-centered {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
}

.appbarTitle {
  color: 'var(--green-dark)';
  margin: '0 0.25rem 1rem 0.25rem';
  font-size: 2.25rem;
  font-weight: bold;
  cursor: pointer;
  max-width: fit-content;
  display: inline-block;
}
</style>
