<script setup>
import { onMounted, ref } from 'vue';
import { useDisplay } from 'vuetify';
import reservationsHelper from '../firebase/reservationsHelper.js';
import { useRouter } from 'vue-router';
//TODO: add view calendar to see the current reservation
const display = useDisplay();
const router = useRouter();
const currentReservation = ref(null);
const pastReservations = ref([]);
const errorSnackbar = ref(false);
const loading = ref(true);

async function fetchReservations() {
  const response = await reservationsHelper.getMyReservations();
  if(response.success){
    pastReservations.value = response.data.pastReservations;
    currentReservation.value = response.data.currentReservation;
    // console.log(pastReservations.value)
    loading.value = false;
  }else{
    showErrorSnackbar();
  }
}

fetchReservations();

function showErrorSnackbar(){
  errorSnackbar.value = true;
}

function formatDate(date) {
  const dateObj = new Date(date);
  // const localTime = new Date(dateObj.getTime() - (8 * 60 * 60 * 1000)); // subtract 8 hours for UTC-8
  const localTime = new Date(dateObj.getTime());
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  return localTime.toLocaleString('en-US', options);
}
</script>

<template>
  <v-container>
    <v-row align="start">
      <v-col class="text-center">
        <v-row>
          <v-col cols="12" md="6">
            <div class="active-reservation-wrapper">
              <h2>Current Reservation</h2>
              <v-sheet width="100%">
                <v-card :height="currentReservation? 325:250" class="text center" hover>
                  <!-- <v-card-title>Current Reservation</v-card-title> -->
                  <v-card-text v-if="loading">
                    <v-progress-circular
                      indeterminate
                      color="green"
                    ></v-progress-circular>
                  </v-card-text>
                  <v-card-text v-else-if="currentReservation">
                    <v-row>
                      <v-col>
                        <p class="dates">{{ formatDate(currentReservation.startTime) }}</p>
                        <p class="dates">to</p>
                        <p class="dates">{{ formatDate(currentReservation.endTime) }}</p>
                      </v-col>
                      <v-col>
                        <p class="seat">Seat No.</p>
                        <p><span class="seatno">{{currentReservation.seatNo}}</span></p>
                      </v-col>
                    </v-row>
                    <div>
                      <span>Request Status: </span>
                      <span :class="currentReservation.status">{{currentReservation.status}}</span>
                    </div>
                  </v-card-text>
                  <v-card-text v-else>
                    <h3>You currently have no reservation requested or approved</h3>
                  </v-card-text>
                  <v-card-actions class="d-flex justify-between" v-if="!currentReservation">
                    <v-btn color="white" text @click="router.push('/')">Reserve a seat</v-btn>
                  </v-card-actions>
                </v-card>
              </v-sheet>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="past-reservation-wrapper">
              <h2 v-if="pastReservations.length > 0">Past Reservations</h2>
              <h2 v-else>No Past Reservations</h2>
              <v-sheet width="100%" v-for="reservation in pastReservations" :key="reservation.seatNo">
                <v-card hover>
                  <v-card-text>
                    <p class="d-flex">
                      <span>Seat No {{ reservation.seatNo }}</span>
                      <v-spacer></v-spacer>
                      <span :class="reservation.status"> {{reservation.status}} </span>
                    </p>
                    <p class="dates">{{formatDate(reservation.startTime)}} - {{formatDate(reservation.endTime)}}</p>
                  </v-card-text>
                </v-card>
              </v-sheet>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-snackbar v-model="errorSnackbar" color="red-darken-1" timeout="3000">
      Unable to get data currently
      <template v-slot:actions>
        <v-btn
            color="white"
            variant="text"
            @click="visibleSnackbar = false"
          >
            Close
          </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.active-reservation-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
.past-reservation-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
.v-card-title {
  color: var(--brown-dark);
  font-size: 2rem !important;
}
.v-card-actions .v-btn {
  background-color: var(--brown-medium);
  width: 100%;
}

.v-card-actions .v-btn:hover {
  background-color: var(--brown-dark);
}

.v-card-text {
  padding-block-start: 10%;
  padding-block-end: 10%;
}

.seat {
  font-size: 1.5rem;
  color: black;
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace;
}

.seatno {
  color: var(--brown-medium);
  font-size: 2rem;
  font-weight: 750;
  font-family: 'Courier New', Courier, monospace;
}

div span {
  font-size: 1.2rem;
  font-weight: 750;
  font-family: 'Courier New', Courier, monospace;
}

.approved {
  color: var(--green-medium);
  font-style: oblique;
  text-transform: uppercase;
}

.pending {
  color: orange;
  font-style: oblique;
  text-transform: uppercase;
}

.rejected, .cancelled {
  color: red;
  font-style: oblique;
  text-transform: uppercase;
}

.dates {
  font-size: 1.2rem;
  color: black;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
}
</style>
