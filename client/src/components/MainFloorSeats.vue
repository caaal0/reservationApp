<script setup>
import { ref } from 'vue';
const availableSeats = ref([1, 3, 4, 5, 6, 7, 8, 9, 10]);

// Seats positions with numbers
const seats = ref([
  { x: 190, y: 340, number: 1 },
  { x: 235, y: 340, number: 2 },
  { x: 280, y: 340, number: 3 },
  { x: 143, y: 270, number: 4 },
  { x: 143, y: 225, number: 5 },
  { x: 143, y: 180, number: 6 },
  { x: 180, y: 132, number: 7 },
  { x: 225, y: 132, number: 8 },
  { x: 270, y: 132, number: 9 },
  { x: 270, y: 260, number: 10 },
  { x: 180, y: 260, number: 11 },
  { x: 180, y: 195, number: 12 },
  { x: 270, y: 195, number: 13 },
]);

const selectSeat = (seatNumber) =>{
  alert(`Seat ${seatNumber} selected`);
}
</script>

<template>
  <svg width="100%" height="500px" viewBox="0 0 500 500">
    <!-- wall outline -->
    <path d="M0,50 l0,50 l110,0 l0,300 l300,0 l0,-350 l-75,0 l0,50 l-175,0 l0,-50 z" stroke="brown" fill="transparent" stroke-width="5" />
    <!-- door to cr -->
    <path d="M100,50 l0,50" stroke="brown" stroke-width="2" fill="transparent" />
    <!-- counter -->
    <rect x="305" y="102" width="50" height="175" fill="gray" />
    <!-- Tables -->
    <rect x="180" y="100" width="125" height="30" fill="saddlebrown" />
    <rect x="110" y="175" width="30" height="125" fill="saddlebrown" />
    <rect x="210" y="185" width="55" height="45" fill="saddlebrown" />
    <rect x="210" y="250" width="55" height="45" fill="saddlebrown" />
    <rect x="180" y="368" width="135" height="30" fill="saddlebrown" />
    <path
      d="
        M 200,100
        A 50,50 0 1,1 300,0
        L 400,0
        Z
      "
      fill="blue"
      stroke="black"
      stroke-width="2"
    />
    <!-- Seats -->
    <g v-for="seat in seats" :key="seat.number">
      <!-- Seat rectangle -->
      <rect
        :x="seat.x"
        :y="seat.y"
        width="25"
        height="25"
        stroke="black"
        stroke-width="1"
        :fill="availableSeats.includes(seat.number) ? 'green' : 'red'"
        @click="selectSeat(seat.number)"
        style="cursor: pointer"
      />
      <!-- Seat number text inside the rectangle -->
      <text
        :x="seat.x + 12.5"
        :y="seat.y + 17"
        font-size="10"
        fill="white"
        text-anchor="middle"
      >
        {{ seat.number }}
      </text>
    </g>
    <!-- texts -->
    <text x="5" y="80" font-size="0.75rem" fill="saddlebrown">COMFORT ROOM</text>
    <text x="325" y="140" rotate="90" font-size="1rem" fill="white">C</text>
    <text x="325" y="155" rotate="90" font-size="1rem" fill="white">O</text>
    <text x="325" y="170" rotate="90" font-size="1rem" fill="white">U</text>
    <text x="325" y="185" rotate="90" font-size="1rem" fill="white">N</text>
    <text x="325" y="200" rotate="90" font-size="1rem" fill="white">T</text>
    <text x="325" y="215" rotate="90" font-size="1rem" fill="white">E</text>
    <text x="325" y="230" rotate="90" font-size="1rem" fill="white">R</text>
  </svg>
</template>
