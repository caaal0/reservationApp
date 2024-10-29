<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginHelper } from '../firebase/authHelper.js'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

const formRef = ref(null)

const showSnackbar = ref(false)
const snackBarSuccess = ref(true)
const snackBarMsg = ref('')

const required = (value) => !!value || 'This field is required.'
const validEmail = (value) => /.+@.+\..+/.test(value) || 'E-mail must be valid.'
const minPasswordLength = (value) => value.length >= 6 || 'Password must be at least 6 characters long.'

const emit = defineEmits(['close', 'switch-to-login', 'signup-success'])

async function signup() {
  // alert(`${name.value}, ${email.value}, ${password.value}`)
  if(await validateForm()){
  }else{
    snackBarMsg.value = 'Please fill out the form correctly.'
    snackBarSuccess.value = false
    showSnackbar.value = true
    return
  }
  loading.value = true;
  try {
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
          name: name.value,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('Signup successful:', data);
        loading.value = false;
        // directly login after signing up
        const msg = loginHelper(email.value, password.value);
        emit('signup-success');
        // Handle success (e.g., redirect or show a message)
      } else {
        console.error('Signup failed');
        alert('Signup failed');
        // Handle failure (e.g., show an error message)
      }
    } catch (error) {
      console.error('Error:', error);
    }
}

async function validateForm() {
  const validity = ref(null);
  if (formRef.value) {
    validity.value = await formRef.value.validate()
  }else{
    return false
  }
  console.log(validity.value)
  return validity.value.valid
}

</script>

<template>
  <v-container class="fill-height" :style="{background: 'var(--white)'}">
    <v-row justify="center">
      <v-col cols="9" class="text-center">
        <v-btn icon="$close" variant="text" @click="$emit('close')" class="close-btn" density="compact">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <h1>Signup</h1>
        <v-form ref="formRef">
          <v-text-field
          v-model="email"
          label="Email"
          required
          :rules="[required, validEmail]"
          maxlength="64"
          ></v-text-field>
          <v-text-field
          v-model="password"
          label="Password"
          required
          type="password"
          maxlength="32"
          :rules="[required, minPasswordLength]"
          ></v-text-field>
          <v-text-field
            v-model="name"
            label="Name"
            required
            :rules="[required]"
            maxlength="50"
          ></v-text-field>
          <v-btn
            color="green"
            style="margin-bottom: 20px;"
            type="button"
            :loading="loading"
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
            <v-snackbar
              v-model="showSnackbar"
              :color="snackBarSuccess? 'green':'red'"
            >{{ snackBarMsg }}
            </v-snackbar>
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

</style>
