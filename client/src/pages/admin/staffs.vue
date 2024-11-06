<script setup>
import { onMounted, ref } from 'vue'
import usersHelper from '@/firebase/usersHelper';

const required = (value) => !!value || 'This field is required.'
const validEmail = (value) => /.+@.+\..+/.test(value) || 'E-mail must be valid.'
const isNumeric = (value) => /^\d+$/.test(value) || 'This field must be a number.'

const dialogAddStaff = ref(false)
const name = ref('')
const email = ref('')
const contactNo = ref('')
const defaultPassword = 'password'
const role = 'staff'
const loading = ref(false)
const loadingStaff = ref(false)

const showSnackbar = ref(false)
const snackBarSuccess = ref(true)
const snackBarMsg = ref('')

const formRef = ref(null)

async function addStaff(){
  if (await validateForm()) {
    loading.value = true
    try{
      const response = await usersHelper.createStaff({
        name: name.value,
        email: email.value,
        contactNo: contactNo.value,
        password: defaultPassword,
      })
      if(response.success){
        snackBarMsg.value = 'Staff added successfully.'
        snackBarSuccess.value = true
        showSnackbar.value = true
        dialogAddStaff.value = false
        clearFields()
        loadStaffs()
      }else{
        snackBarMsg.value = response.message
        snackBarSuccess.value = false
        showSnackbar.value = true
      }
    }catch(error){
      console.error('Error:', error)
      snackBarMsg.value = 'An error occurred. Please try again.'
      snackBarSuccess.value = false
      showSnackbar.value = true
    }finally{
      loading.value = false
    }
  }else{
    snackBarMsg.value = 'Please fill out the form correctly.'
    snackBarSuccess.value = false
    showSnackbar.value = true
  }
}

function clearFields(){
  name.value = ''
  email.value = ''
  contactNo.value = ''
}

async function validateForm() {
  const validity = ref(null);
  if (formRef.value) {
    validity.value = await formRef.value.validate()
  }else{
    return false
  }
  return validity.value.valid
}

function closeDialog() {
  dialogAddStaff.value = false
  if (formRef.value) {
    formRef.value.resetValidation() // Reset validation when dialog is closed
  }
}

const staffs = ref([])

async function loadStaffs() {
  loadingStaff.value = true
  try {
    const response = await usersHelper.getStaffs()
    staffs.value = response.data
  } catch (error) {
    console.error('Error:', error)
  }finally{
    loadingStaff.value = false
  }
}

onMounted(async () => {
  await loadStaffs()
})

async function deleteStaff(staffId){
  try{
    const response = await usersHelper.deleteStaff(staffId)
    if(response.success){
      snackBarMsg.value = 'Staff deleted successfully.'
      snackBarSuccess.value = true
      loadStaffs()
    }else{
      snackBarMsg.value = response.message
      snackBarSuccess.value = false
    }
  }catch(error){
    console.error('Error:', error)
    snackBarMsg.value = 'An error occurred. Please try again.'
    snackBarSuccess.value = false
  }finally{
    showSnackbar.value = true
  }
}
</script>

<template>
  <v-container>
    <h1>Staffs</h1>
    <v-row>
      <v-col>
        <v-card
          hover
          @click="dialogAddStaff = true"
          height="125"
        >
          <v-card-title>
            <v-icon>mdi-plus</v-icon>
            Add Staff
          </v-card-title>
        </v-card>
        <hr>
        <!-- staff cards -->
        <div v-if="!loadingStaff">
          <v-card hover v-for="staff in staffs" :key="staff.staffId">
            <v-card-title>
              {{ staff.name }}
            </v-card-title>
            <v-card-text>
              <p><strong>Email:</strong> {{ staff.email }}</p>
              <p><strong>Contact Number:</strong> {{ staff.contactNo }}</p>
              <p><strong>Staff ID:</strong> {{staff.staffId}}</p>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="red"
                text
                @click="deleteStaff(staff.staffId)"
              >Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
        <div class="text-center" style="margin-top: 20px;" v-else>
          <v-progress-circular
            indeterminate
            color="green"
          ></v-progress-circular>
        </div>

        <!-- add staff dialog -->
        <v-dialog
          v-model="dialogAddStaff"
          max-width="600"
        >
          <v-card>
            <v-card-title>
              Add Staff
            </v-card-title>
            <v-card-text>
              <v-form ref="formRef">
                <v-text-field
                  v-model="name"
                  label="Name"
                  required
                  :rules="[required]"
                  maxlength="50"
                ></v-text-field>
                <v-text-field
                  v-model="email"
                  label="Email"
                  required
                  :rules="[required, validEmail]"
                  maxlength="64"
                ></v-text-field>
                <v-text-field
                  v-model="contactNo"
                  label="Contact Number"
                  required
                  :rules="[required, isNumeric]"
                  maxlength="11"
                  inputmode="numeric"
                ></v-text-field>
                <v-btn
                  color="green"
                  style="margin-bottom: 20px;"
                  type="button"
                  :loading="loading"
                  @click="addStaff"
                  width="100%"
                >
                  Add
                </v-btn>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn
                class="cancelBtn"
                color="error"
                @click="closeDialog"
                text
              >Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
.cancelBtn {
  color: white;
}

.v-card {
  margin-bottom: 1rem;
  margin-top: 0.5rem;
}
</style>
