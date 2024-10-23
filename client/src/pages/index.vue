<script setup>
import MainFloorSeats from '@/components/MainFloorSeats.vue';
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import SeatCalendar from '@/components/SeatCalendar.vue';

//TODO: use :special-hours in vuecal to indicate closed time or booked hours
const showSeatCalendar = ref(false);
const selectedSeat = ref(null);

const display = useDisplay();

function selectSeat(seat) {
  const seatNumber = seat;
  selectedSeat.value = seatNumber;
  // alert(`Seat ${seatNumber} selected`);
  showSeatCalendar.value = true;
}

</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col class="text-center" cols="12" >
        <h1>3rd floor</h1>
        <MainFloorSeats @seat-selected="selectSeat"/>
        <v-dialog v-model="showSeatCalendar" width="1000">
          <SeatCalendar :selectedSeat="selectedSeat" @close="showSeatCalendar = false"/>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>
