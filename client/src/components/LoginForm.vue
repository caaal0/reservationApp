<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginHelper } from '../firebase/authHelper.js';

const email = ref('')
const password = ref('')
const loading = ref(false)
const visible = ref(false)

const emit = defineEmits(['close', 'switch-to-signup', 'login-success'])

async function login(){
  loading.value = true;
  try{
    const msg = await loginHelper(email.value, password.value);
    if (msg.success == true) {
      loading.value = false;
      emit('login-success');
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
  <v-container class="fill-height" :style="{background: 'var(--white)'}">
    <v-row justify="center">
      <v-col cols="9" class="text-center">
        <v-btn icon="$close" variant="text" @click="$emit('close')" class="close-btn" density="compact">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <h1>Login</h1>
        <v-form>
          <v-text-field
            v-model="email"
            label="Email"
            required
            maxlength="64"
            variant="outlined"
            color="green-darken-4"
          ></v-text-field>
          <v-text-field
          v-model="password"
            label="Password"
            required
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            @click:append-inner="visible = !visible"
            variant="outlined"
            maxlength="32"
            color="green-darken-4"
          ></v-text-field>
          <v-btn
            @click="login(email.valueOf(), password.valueOf())"
            color="green"
            style="margin-bottom: 20px;"
            type="button"
            :loading="loading"
            width="100%"
            rounded="false"
          >
            Login
          </v-btn>

        </v-form>
        <div class="or-divider">
          <span>or continue with</span>
        </div>
        <Google @success="emit('login-success')"/>
        <v-row align="end" justify="center">
          <v-col class="text-center">
            <span>Don't have an account?</span>
            <v-btn
              variant="text"
              color="var(--green-light)"
              @click="$emit('switch-to-signup')"
            >
              Signup
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--green-dark);
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background-color: var(--red-light);
  transition: background-color 0.3s ease, color 0.3s ease;
}
.close-btn:hover {
  background-color: transparent;
}

.close-btn .v-icon {
  color: white;
}
.close-btn .v-icon:hover {
  color: var(--brown-dark);
}

.or-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: grey;
  margin: 16px 0;
}

.or-divider::before,
.or-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background-color: #ddd;
  margin: 0 8px;
}
</style>
