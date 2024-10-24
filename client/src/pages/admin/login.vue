<script setup>
import { ref } from 'vue'
import { loginHelper } from '../../firebase/authHelper.js'
import { useRouter } from 'vue-router'
import { auth } from '../../firebase/firebase.js';
import { signOut} from 'firebase/auth';
import { useAuthStore } from '../../stores/auth.js';

const authStore = useAuthStore();
const router = useRouter();
const email = ref('')
const password = ref('')
const loading = ref(false)

async function login(){
  loading.value = true;
  try{
    const msg = await loginHelper(email.value, password.value);
    if (msg.success == true) {
      loading.value = false;
      if(authStore.userRole == 'admin') {
        console.log('Login successful and user is admin');
        router.push('/admin');
      }else{
        console.error('Unauthorized user');
        alert('Unauthorized user');
        signOut(auth);
        authStore.clearUser();
      }
      // emit('login-success');
    } else {
      console.error('Login failed');
      console.log(msg.error);
      // alert('Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
    // alert('Login error.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container>
    <v-row justify="center" class="fill-height">
      <v-col class="text-center" cols="12" md="6">
        <h1>Admin Login</h1>
        <v-form>
          <v-text-field
            v-model="email"
            label="Email"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            required
            type="password"
          ></v-text-field>
          <v-btn
            @click="login()"
            color="green"
            type="button"
            width="100%"
            :loading="loading"
          >
            Login
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.v-btn {
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
