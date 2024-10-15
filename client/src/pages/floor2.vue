<script setup>
import AppFooter from '@/components/AppFooter.vue';
import LowerFloorSeats from '@/components/LowerFloorSeats.vue';
import { ref } from 'vue';
import SeatCalendar from '@/components/SeatCalendar.vue';

const seatActive = ref(false);
const selectedSeat = ref(null);

function selectSeat(seat) {
  const seatNumber = seat;
  selectedSeat.value = seatNumber;
  // alert(`Seat ${seatNumber} selected`);
  seatActive.value = true;
}
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col class="text-center">
        <h1>2nd floor</h1>
        <lower-floor-seats @seat-selected="selectSeat" />
        <v-dialog v-model="seatActive" width="1000">
          <SeatCalendar :selectedSeat="selectedSeat" @close="seatActive = false"/>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
