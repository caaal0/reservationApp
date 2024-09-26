<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const email = ref('')
const password = ref('')
const router = useRouter()

function login() {
  alert(`${email.value}, ${password.value}`)
}

</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="6" class="text-center">
        <h1>Login</h1>
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
            @click="login"
            color="green"
            style="margin-bottom: 20px;"
          >
            Login
          </v-btn>

        </v-form>
        <v-row align="end" justify="center">
          <v-col class="text-center">
            <span>Don't have an account?</span>
            <v-btn
              variant="text"
              color="var(--green-light)"
              @click="router.push('/signup')"
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
  color: var(--black);
  font-size: 2.5rem;
  margin-bottom: 20px;
  align-self: center;
}

</style>
