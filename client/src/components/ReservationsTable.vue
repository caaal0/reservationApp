<script setup>
import { onMounted, ref } from 'vue'
import reservationsHelper from '../firebase/reservationsHelper.js';

const headers = [
  {
    title: 'Reservation ID',
    align: 'start',
    sortable: false,
    key: 'reservationId',
  },
  { title: 'Start', key: 'startTime', align: 'end' },
  { title: 'End', key: 'endTime', align: 'end' },
  { title: 'Seat Number', key: 'seatNo', align: 'end' },
  { title: 'Created At', key: 'createdAt', align: 'end' },
  { title: 'User', key: 'name', align: 'end' },
  { title: 'Status', key: 'status', align: 'end' },
  // { title: 'Action by', key: 'actionBy', align: 'end' },
];

const search = ref('');
const loading = ref(true);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const serverItems = ref([]);

//for dialog
const dialog = ref(false);
const selectedReservation = ref(null);

//for search
const name = ref('');
const user = ref('');
const status = ref([]);

const snackBarMsg = ref('');
const snackBarSuccess = ref(true);
const showSnackbar = ref(false);

//for updating the table contents when search filters change
async function loadItems({page, itemsPerPage, sortBy}) {
  loading.value = true;
  try {
    const data = await reservationsHelper.getReservationsForTable({
      page,
      itemsPerPage,
      sortBy,
      search: {name: name.value, status: status.value},
    });
    serverItems.value = data.data;
    totalItems.value = data.totalItems;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
}

watch([name, status], () => {
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
  selectedReservation.value = item.item;
  dialog.value = true;
}

async function actionReservation({reservationId, action}) {
  // console.log(reservationId, action);
  try{
    const response = await reservationsHelper.actionReservation(reservationId, action);
    // console.log(response);
    if(response.success){
      dialog.value = false;
      loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [] });
      snackBarMsg.value = `Reservation ${action} successfully.`;
    }else{
      console.log(response.msg);
      snackBarMsg.value = response.error || 'Error occurred. Please try again.';
      snackBarSuccess.value = false;
    }
  } catch (error) {
    console.error('Error:', error);
  }finally{
    showSnackbar.value = true;
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'approved':
      return 'status-approved';
    case 'rejected':
      return 'status-rejected';
    case 'pending':
      return 'status-pending';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return '';
  }
}

</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Reservations</h1>
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
              <v-chip-group
                v-model="status"
                active-class="selected-chip"
                color="green-darken-1"
              >
                <v-chip value="approved" text="Approved" variant="outlined" filter></v-chip>
                <v-chip value="rejected" text="Rejected" variant="outlined" filter></v-chip>
                <v-chip value="pending" text="Pending" variant="outlined" filter></v-chip>
                <v-chip value="cancelled" text="Cancelled" variant="outlined" filter></v-chip>
              </v-chip-group>
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
          item-value="reservationId"
          :hover="true"
          @update:options="loadItems"
          @click:row="handleRowClick"
          mobile-breakpoint="xs"
        >
        <template v-slot:body="{ items }">
          <tr
            v-for="(item, index) in items"
            :key="index"
            @click="handleRowClick($event, { item })"
            :class="item.cancelRequest? 'clickable-row cancel-request' : 'clickable-row'"
            >
            <td>{{ item.reservationId }}</td>
            <td>{{ item.startTime }}</td>
            <td>{{ item.endTime }}</td>
            <td>{{ item.seatNo }}</td>
            <td>{{ item.createdAt }}</td>
            <td>{{ item.name }}</td>
            <td :class="getStatusClass(item.status)">
              {{ item.status }}
            </td>
          </tr>
        </template>
        </v-data-table-server>

        <!-- Reservation Details Dialog -->
        <v-dialog v-model="dialog" max-width="600px">
          <v-card>
            <v-card-title>Reservation Details</v-card-title>
            <v-card-text>
              <div v-if="selectedReservation">
                <p><strong>Reservation ID:</strong> {{ selectedReservation.reservationId }}</p>
                <p><strong>Created At:</strong> {{ selectedReservation.createdAt }}</p>
                <p><strong>Start Time:</strong> {{ selectedReservation.startTime }}</p>
                <p><strong>End Time:</strong> {{ selectedReservation.endTime }}</p>
                <p><strong>Seat Number:</strong> {{ selectedReservation.seatNo }}</p>
                <p><strong>User:</strong> {{ selectedReservation.name }}</p>
                <p><strong>Status:</strong> {{ selectedReservation.status }}</p>
                <p><strong>Action by:</strong> {{ selectedReservation.actionBy }}</p>
                <p v-if="selectedReservation.cancelRequest"><strong>Requested to Cancel</strong></p>
              </div>
              <div v-else>
                <p>No reservation selected.</p>
              </div>
            </v-card-text>
            <v-card-actions>
              <!-- reservation is cancellable as long as it is not yet the endTime -->
              <v-btn v-if=" new Date() < new Date(selectedReservation.endTime)" color="red-darken-1" @click="actionReservation({reservationId: selectedReservation.reservationId, action:'cancelled'})">Cancel</v-btn>
              <v-spacer></v-spacer>
              <div class="actionButtons" v-if="selectedReservation.status == 'pending'">
                <v-btn color="green-darken-1" @click="actionReservation({reservationId: selectedReservation.reservationId, action:'approved'})">Approve</v-btn>
                <v-btn color="red" @click="actionReservation({reservationId: selectedReservation.reservationId, action:'rejected'})">Reject</v-btn>
              </div>
              <v-btn color="#3a5335" @click="dialog = false">Close</v-btn>
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
.filters {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

h1 {
  margin-bottom: 20px;
  color: var(--green-dark);
}

.clickable-row {
  cursor: pointer;
}

.cancel-request{
  background-color: #ffcccc;
}

.status-approved {
  color: green;
  font-weight: bold;
}

.status-rejected {
  color: red;
  font-weight: bold;
}

.status-pending {
  color: orange;
  font-weight: bold;
}

.status-cancelled {
  color: gray;
  font-weight: bold;
}
</style>
