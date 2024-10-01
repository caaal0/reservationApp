<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

const required = (value) => !!value || 'This field is required.'
const validEmail = (value) => /.+@.+\..+/.test(value) || 'E-mail must be valid.'
const minPasswordLength = (value) => value.length >= 6 || 'Password must be at least 6 characters long.'

function signup() {
  alert(`${name.value}, ${email.value}, ${password.value}`)
  router.push('/')
}

// function signup(){
//   fetch('http://localhost:3000/api/auth/signup', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       name: name.value,
//       email: email.value,
//       password: password.value
//     })
//   })
//   .then(res => res.json())
//   .then(data => {
//     if (data.error) {
//       alert(data.error)
//     } else {
//       router.push('/login')
//     }
//   })
//   .catch(err => console.error(err))
// }
</script>

<template>
  <v-container class="fill-height" :style="{background: 'var(--white)'}">
    <v-row justify="center">
      <v-col cols="9" class="text-center">
        <v-btn icon="$close" variant="text" @click="$emit('close')" class="close-btn" density="compact">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <h1>Signup</h1>
        <v-form>
          <v-text-field
          v-model="email"
          label="Email"
          required
          :rules="[required, validEmail]"
          ></v-text-field>
          <v-text-field
          v-model="password"
          label="Password"
          required
          type="password"
          :rules="[required, minPasswordLength]"
          ></v-text-field>
          <v-text-field
            v-model="name"
            label="Name"
            required
            :rules="[required]"
          ></v-text-field>
          <v-btn
            type="submit"
            color="green"
            style="margin-bottom: 20px;"
            @click="signup"
          >
            Signup
          </v-btn>

        </v-form>
        <v-row align="end" justify="center">
          <v-col class="text-center">
            <span>Already have an account?</span>
            <v-btn
              variant="text"
              color="var(--green-light)"
              @click="$emit('switch-to-login')"
            >
              Login
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

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background-color: var(--red-light);
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

</style>
