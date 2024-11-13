<script setup>
import { onMounted, ref } from 'vue'

const seatActive = ref(false);
const selectedSeat = ref(null);

function selectSeat(seat) {
  const seatNumber = seat;
  selectedSeat.value = seatNumber;
  // alert(`Seat ${seatNumber} selected`);
  seatActive.value = true;
}

const floors = [
  { id: 3, name: '3rd Floor (Main)' },
  { id: 4, name: '4th Floor' },
  // { id: 2, name: '2nd Floor' },
];

const selectedFloor = ref(3);

</script>

<template>
  <v-container>
    <h1>Walk-ins</h1>
    <v-row>
      <!-- floors -->
      <v-col cols="12" md="4" xs="2">
        <v-list bg-color="transparent">
          <v-list-item
            title="Floors"
            :style="{color: 'var(--black)', margin: '2rem 1.5rem 0.5rem 1rem', fontSize: '1.5rem'}"
          ></v-list-item>
          <v-list-item
            v-for="floor in floors"
            :key="floor.id"
            @click="selectedFloor = floor.id"
          >
            <v-list-item-title>{{ floor.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col v-if="selectedFloor == 3" cols="12" md="8" xs="10">
        <main-floor-seats @seat-selected="selectSeat"/>
        <v-dialog v-model="seatActive" width="1000">
          <SeatCalendar :selectedSeat="selectedSeat" @close="seatActive = false"/>
        </v-dialog>
      </v-col>
      <v-col v-if="selectedFloor == 4" cols="12" md="8" xs="10">
        <upper-floor-seats @seat-selected="selectSeat"/>
        <v-dialog v-model="seatActive" width="1000">
          <SeatCalendar :selectedSeat="selectedSeat" @close="seatActive = false"/>
        </v-dialog>
      </v-col>
      <!-- <v-col v-if="selectedFloor == 2" cols="12" md="8" xs="10">
        <lower-floor-seats @seat-selected="selectSeat"/>
        <v-dialog v-model="seatActive" width="1000">
          <SeatCalendar :selectedSeat="selectedSeat" @close="seatActive = false"/>
        </v-dialog>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<style scoped>
</style>
