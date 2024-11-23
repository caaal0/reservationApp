<script setup>
import MainFloorSeats from '@/components/MainFloorSeats.vue';
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import SeatCalendar from '@/components/SeatCalendar.vue';
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import usersHelper from '@/firebase/usersHelper';

//TODO: use :special-hours in vuecal to indicate closed time or booked hours
const showSeatCalendar = ref(false);
const selectedSeat = ref(null);
const showHint = ref(true);

const authStore = useAuthStore();

const reservationAlert = ref(false);
const reservationAlertMsg = ref('');

const display = useDisplay();

function selectSeat(seat) {
  const seatNumber = seat;
  selectedSeat.value = seatNumber;
  // alert(`Seat ${seatNumber} selected`);
  showSeatCalendar.value = true;
}

async function clearReservationAlert(){
  reservationAlert.value = false;
  reservationAlertMsg.value = '';
  const response = await usersHelper.clearReservationAlert(authStore.user.uid);
  // console.log(response);
  // if(response.success){
  //   console.log('Reservation alert cleared');
  // }else{
  //   console.error('Error clearing reservation alert');
  // }
}

onMounted(async () => {
  // console.log('mounted');

  setTimeout(() => {
    showHint.value = false;
  }, 5000);
  if(authStore.userRole === 'customer'){
    // console.log('checking for reservation alert');
    const response = await usersHelper.getCustomer(authStore.user.uid);
    if(response.success){
      if(response.data.reservationAlert){
        reservationAlertMsg.value = response.data.reservationAlertMsg;
        reservationAlert.value = true;
      }
    }
  }
});

</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col class="text-center" cols="12" >
        <h1>
          3rd floor
          <v-tooltip activator="parent" v-model="showHint" location="bottom">
            Select a seat to reserve
          </v-tooltip>
        </h1>
        <MainFloorSeats @seat-selected="selectSeat"/>
        <!-- seat calendar dialog -->
        <v-dialog v-model="showSeatCalendar" width="1000">
          <SeatCalendar :selectedSeat="selectedSeat" @close="showSeatCalendar = false"/>
        </v-dialog>
        <!-- reservation alert dialog -->
        <v-dialog v-model="reservationAlert" max-width="500px" transition="dialog-top-transition" persistent>
          <v-card>
            <v-card-title>Reservation Alert</v-card-title>
            <v-card-text>
              <p>{{reservationAlertMsg}}</p>
            </v-card-text>
            <v-card-actions>
              <v-btn color="red" @click="clearReservationAlert">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
