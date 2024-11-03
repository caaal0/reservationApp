<script setup>
import { ref } from 'vue'
import { loginHelper } from '../../firebase/authHelper.js'
import { useRouter } from 'vue-router'
import { auth } from '../../firebase/firebase.js';
import { signOut} from 'firebase/auth';
import { useAuthStore } from '../../stores/auth.js';

const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const unauthorizedSnackbar = ref(false)
const errorSnackbar = ref(false)
const errormsg = ref('')

const visible = ref(false)

async function login(){
  loading.value = true;
  try{
    const msg = await loginHelper(email.value, password.value);
    if (msg.success == true) {
      loading.value = false;
      if(authStore.userRole == 'staff') {
        console.log('Login successful and user is staff');
        router.push('/staff');
      }else{
        console.error('Unauthorized user');
        // alert('Unauthorized user');
        unauthorizedSnackbar.value = true;
        signOut(auth);
        authStore.clearUser();
      }
      // emit('login-success');
    } else {
      //if login failed, an error code in .msg
      if(msg.msg == 'invalid-email'){
        errormsg.value = 'Invalid email';
      }else if(msg.msg == 'invalid-credential'){
        errormsg.value = 'Invalid credential';
      }else{
        errormsg.value = 'Login failed';
      }
      errorSnackbar.value = true;
      console.error(msg.msg);
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
        <h1>Staff Login</h1>
        <v-form>
          <v-text-field
            v-model="email"
            label="Email"
            required
            variant="outlined"
            maxlength="64"
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            required
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            @click:append-inner="visible = !visible"
            variant="outlined"
            color="green-darken-4"
            maxlength="32"
          ></v-text-field>
          <v-btn
            @click="login()"
            color="green-darken-1"
            type="button"
            width="100%"
            :loading="loading"
          >
            Login
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <v-snackbar v-model="unauthorizedSnackbar" color="red">
      Unauthorized user.
    </v-snackbar>
    <v-snackbar v-model="errorSnackbar" color="red">
      {{ errormsg }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--brown-dark);
}

.v-btn {
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
