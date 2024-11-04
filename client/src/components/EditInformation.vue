<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import usersHelper from '../firebase/usersHelper';

const customer = ref(null);
const authStore = useAuthStore();

async function getCustomerDetails(){
  const response = await usersHelper.getCustomer(authStore.user.uid)
  if(response.success){
    editFormData.value.name = response.data.name
    editFormData.value.email = response.data.email
    editFormData.value.contact = response.data.contactNo
    customer.value = response.data
  }else{
    console.error('Error getting user details:', response.error)
  }
}

// Default field values from current user data
const editFormData = ref({
  uid: authStore.user?.uid || '',
  name: authStore.user?.displayName || '',
  email: authStore.user?.email || '',
  contact: authStore.user?.phoneNumber || '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

onMounted(async () => {
  // console.log('EditInformation mounted');
  await getCustomerDetails()
});

const showEditInformation = ref(true);
const showChangePassword = ref(false);

const visibleOldPassword = ref(false);
const visibleNewPassword = ref(false);
const visibleConfirmPassword = ref(false);

const formRef = ref(null);
const changePwRef = ref(null);

const loading = ref(false);

const showSnackbar = ref(false)
const snackBarSuccess = ref(true)
const snackBarMsg = ref('')

const emit = defineEmits(['close']);


// Validation rules
const required = (value) => !!value || 'This field is required.'
const validEmail = (value) => /.+@.+\..+/.test(value) || 'E-mail must be valid.'
const minPasswordLength = (value) => value.length >= 6 || 'Password must be at least 6 characters long.'
const passwordMatch = (confirmPassword) => (value) => value === confirmPassword || 'Passwords must match.'
const validContactNumber = (value) => {
  // If the field is empty, return true (valid)
  if (value === '') return true;
  // If the field is not empty, check if it is 11 characters long and only contains numbers
  return /^[0-9]{11}$/.test(value) || 'Contact number must be 11 digits long and contain only numbers.';
};

// Watcher to revalidate password fields
watch(() => editFormData.value.confirmPassword, () => {
  if (changePwRef.value) {
    changePwRef.value.validate(); // Revalidate the form when confirmPassword changes
  }
});

watch(() => editFormData.value.newPassword, () => {
  if (changePwRef.value) {
    changePwRef.value.validate(); // Revalidate the form when newPassword changes
  }
});

async function submitEdit() {
  loading.value=true;
  if(await validateForm(formRef)){
    const oldObj = {
      name: authStore.user.displayName,
      email: authStore.user.email,
      contact: customer.contactNo
    }
    const newObj = {
      name: editFormData.value.name,
      email: editFormData.value.email,
      contact: editFormData.value.contact
    }
    const response = await usersHelper.updateInfo(oldObj, newObj)
    if(response.success){
      // console.log('User info updated successfully:', response)
      snackBarMsg.value = response.msg
      snackBarSuccess.value = true
      showSnackbar.value = true
    }else{
      snackBarMsg.value = response.error
      snackBarSuccess.value = false
      showSnackbar.value = true
    }
    // emit('close')
  }else{
    snackBarMsg.value = 'Please fill out the form correctly.'
    snackBarSuccess.value = false
    showSnackbar.value = true
  }
  loading.value=false;
}

async function changePassword(){
  loading.value = true;
  console.log('Change password clicked');
  if(await validateForm(changePwRef)){
    // Implement password change logic and API call here
    console.log('Password change submitted:', editFormData.value);
    emit('close')
  }else{
    // console.log('Password change failed');
    snackBarMsg.value = 'Please fill out the form correctly.'
    snackBarSuccess.value = false
    showSnackbar.value = true
  }
  loading.value = false;
}

function switchCardText(){
  showEditInformation.value = !showEditInformation.value;
  showChangePassword.value = !showChangePassword.value;
}

async function validateForm(formRef) {
  const validity = ref(null);
  if (formRef.value) {
    validity.value = await formRef.value.validate()
  }else{
    return false
  }
  // console.log(validity.value)
  return validity.value.valid
}
</script>

<template>
  <v-container class="fill-height">
    <v-row>
      <v-col class="text-center">
        <v-card class="form-wrapper">
          <v-card-title>
            <template v-if="showChangePassword" v:slot="prepend">
              <v-icon @click="switchCardText" icon="mdi-chevron-left" style="margin-right:20px"></v-icon>
            </template>
            Edit Information
          </v-card-title>
          <v-card-text v-if="showEditInformation">
            <v-form ref="formRef" @submit.prevent="submitEdit">
              <v-text-field
                v-model="editFormData.name"
                label="Name"
                required
                :rules="[required]"
                maxlength="64"
                color="green-darken-4"
                variant="outlined"
              >
              </v-text-field>
              <v-text-field
                v-model="editFormData.email"
                label="Email"
                required
                :rules="[required, validEmail]"
                maxlength="64"
                color="green-darken-4"
                variant="outlined"
              >
              </v-text-field>
              <v-text-field
                v-model="editFormData.contact"
                label="Contact Number"
                maxlength="11"
                :rules="[validContactNumber]"
                color="green-darken-4"
                variant="outlined"
                type="tel"
              >
              </v-text-field>
              <v-btn class="change-password-btn text-start" rounded="false" color="green-lighten-1" @click="switchCardText">Change Password</v-btn>
              <v-btn width="80%" color="green-darken-1" type="submit" :loading="loading">Save</v-btn>
              <v-btn width="80%" color="green-lighten-1" text @click="emit('close')">Cancel</v-btn>
            </v-form>
          </v-card-text>
          <v-card-text v-else-if="showChangePassword">
            <v-form ref="changePwRef" @submit.prevent="changePassword">
              <v-text-field
                v-model="editFormData.oldPassword"
                label="Old Password"
                required
                :append-inner-icon="visibleOldPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visibleOldPassword ? 'text' : 'password'"
                @click:append-inner="visibleOldPassword = !visibleOldPassword"
                variant="outlined"
                maxlength="32"
                color="green-darken-4"
              >
              </v-text-field>
              <v-text-field
                v-model="editFormData.newPassword"
                label="New Password"
                required
                :rules="[required, minPasswordLength, passwordMatch(editFormData.confirmPassword)]"
                :append-inner-icon="visibleNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visibleNewPassword ? 'text' : 'password'"
                @click:append-inner="visibleNewPassword = !visibleNewPassword"
                variant="outlined"
                maxlength="32"
                color="green-darken-4"
              >
              </v-text-field>
              <v-text-field
                v-model="editFormData.confirmPassword"
                label="Confirm Password"
                required
                :rules="[required, passwordMatch(editFormData.newPassword)]"
                :append-inner-icon="visibleConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visibleConfirmPassword ? 'text' : 'password'"
                @click:append-inner="visibleConfirmPassword = !visibleConfirmPassword"
                variant="outlined"
                maxlength="32"
                color="green-darken-4"
              >
              </v-text-field>
              <v-btn width="80%" color="green-darken-2" type="submit" :loading="loading">Submit Change in Password</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
        <v-snackbar
          v-model="showSnackbar"
          :color="snackBarSuccess? 'green':'red'"
        >{{ snackBarMsg }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

.v-btn {
  margin-bottom: 10px;
}

.change-password-btn {
  margin-bottom: 10px;
  margin-top: 0px;
}

</style>
