<script setup>
import { onMounted, ref } from 'vue'
import usersHelper from '@/firebase/usersHelper';
import reservationsHelper from '@/firebase/reservationsHelper';
//TODO: enable admin to view reservation details in a dialog
const headers = [
  {
    title: 'User ID',
    align: 'start',
    sortable: false,
    key: 'userId',
  },
  { title: 'Name', key: 'name', align: 'end' },
  { title: 'Email', key: 'email', align: 'end' },
  { title: 'Contact Number', key: 'contactNo', align: 'end' },
  // { title: 'Library Card Number', key: 'libraryCardNo', align: 'end' },
];

const search = ref('');
const loading = ref(true);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const serverItems = ref([]);

//for dialog
const dialog = ref(false);
const selectedUser = ref(null);

//for dialog of currentReservation
const dialogCurrentReservation = ref(false);
const reservationDetails = ref(null);

//for search
const name = ref('');
const email = ref('');

const snackBarMsg = ref('');
const snackBarSuccess = ref(true);
const showSnackbar = ref(false);

//for updating the table contents when search filters change
async function loadItems({page, itemsPerPage, sortBy}) {
  loading.value = true;
  try {
    const data = await usersHelper.getCustomersForTable({
      page,
      itemsPerPage,
      sortBy,
      search: {name: name.value, email: email.value},
    });
    serverItems.value = data.data;
    totalItems.value = data.totalItems;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
}

watch([name, email], () => {
  search.value = String(Date.now());
});

onMounted(() => {
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [] });
});

function handleRowClick(event, item) {
  openDialog(item);
}

function openDialog(item) {
  // item.item to access the contents of the row
  selectedUser.value = item.item;
  dialog.value = true;
}

async function deleteUser(){
  console.log('Delete user:', selectedUser.value);
  try{
    const response = await usersHelper.deleteUser(selectedUser.value.userId);
    console.log(response)
    if(response.success){
      dialog.value = false;
      loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [] });
      snackBarMsg.value = 'User deleted successfully';
      snackBarSuccess.value = true;
    }else{
      console.error('Error deleting user');
      snackBarMsg.value = 'Error deleting user';
      snackBarSuccess.value = false;
    }
  } catch (error) {
    console.error('Error:', error);
  }finally{
    showSnackbar.value = true;
  }
}

async function loadCurrentReservation(){
  try{
    const response = await reservationsHelper.getReservation(selectedUser.value.currentReservation);
    if(response.success){
      reservationDetails.value = response.data;
      dialogCurrentReservation.value = true;
    }else{
      console.error('Error getting reservation');
      snackBarMsg.value = response.error;
      snackBarSuccess.value = false;
      showSnackbar.value = true;
    }
  }catch(error){
    console.error('Error getting reservation');
      snackBarMsg.value = response.error;
      snackBarSuccess.value = false;
      showSnackbar.value = true;
  }
}
</script>

<template>
  <v-container>
    <h1>Users</h1>
    <v-row>
      <v-col>
      <!-- Search Filters -->
        <div class="filters">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="name"
                class="ma-2"
                density="compact"
                placeholder="Search name of customer..."
                hide-details
                maxlength="50"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="email"
                class="ma-2"
                density="compact"
                placeholder="Search by email..."
                hide-details
                maxlength="64"
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
        <!-- Data Table -->
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="serverItems"
          :items-length="totalItems"
          :loading="loading"
          :search="search"
          item-value="userId"
          :hover="true"
          @update:options="loadItems"
          @click:row="handleRowClick"
        ></v-data-table-server>
        <!-- User Details Dialog -->
        <v-dialog v-model="dialog" max-width="600px">
          <v-card>
            <v-card-title>User Details</v-card-title>
            <v-card-text>
              <div v-if="selectedUser">
                <p><strong>User ID:</strong> {{ selectedUser.userId }}</p>
                <p><strong>Name:</strong> {{ selectedUser.name }}</p>
                <p><strong>Email:</strong> {{ selectedUser.email }}</p>
                <p><strong>Contact Number:</strong> {{ selectedUser.contactNo }}</p>
                <!-- <p><strong>Current Reservation ID:</strong> {{ selectedUser.currentReservation }}</p> -->
                 <v-btn v-if="selectedUser.currentReservation" rounded="false" color="green-lighten-5" @click="loadCurrentReservation">View Current Reservation Details</v-btn>
              </div>
              <div v-else>
                <p>No reservation selected.</p>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn class="closeBtn" @click="deleteUser" color="red">Delete</v-btn>
              <v-spacer></v-spacer>
              <!-- <div class="actionButtons" v-if="selectedUser.status == 'pending'">
                <v-btn color="green" @click="actionReservation({reservationId: selectedUser.reservationId, action:'approved'})">Approve</v-btn>
                <v-btn color="red" @click="actionReservation({reservationId: selectedUser.reservationId, action:'rejected'})">Reject</v-btn>
              </div> -->
              <v-btn class="closeBtn" @click="dialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogCurrentReservation" max-width="450px">
          <v-card>
            <v-card-title>Current Reservation Details</v-card-title>
            <v-card-text>
              <div v-if="reservationDetails">
                <p><strong>Reservation ID:</strong> {{ selectedUser.currentReservation }}</p>
                <p><strong>Start Time:</strong> {{ reservationDetails.startTime }}</p>
                <p><strong>End Time:</strong> {{ reservationDetails.endTime }}</p>
                <p><strong>Seat Number:</strong> {{ reservationDetails.seatNo }}</p>
                <p><strong>Created At:</strong> {{ reservationDetails.createdAt }}</p>
                <p><strong>Status:</strong> {{ reservationDetails.status }}</p>
              </div>
              <div v-else>
                <p>No reservation details available.</p>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn class="closeBtn" @click="dialogCurrentReservation = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-snackbar v-model="showSnackbar" :color="snackBarSuccess? 'green':'red'">
          {{ snackBarMsg }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
</style>
