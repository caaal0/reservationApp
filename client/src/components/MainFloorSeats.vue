<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue';
import { useSeatsStore } from '@/stores/seats';

const seatsStore = useSeatsStore();
const availableSeats = ref([]);

watchEffect(() => {
  if(seatsStore.loading) {
    console.log('Loading seats');
  } else {
    // console.log(seatsStore.seats);
    console.log('Seats loaded');
    addAvailableSeats();
  }
});
seatsStore.listenToSeats();

function addAvailableSeats(){
  availableSeats.value = [];
  for(const seat of seatsStore.seats) {
    if(seat.available == true) {
      availableSeats.value.push(seat.id);
    }
  }
  // console.log(availableSeats.value);
}

// Seats positions with numbers
const seats = [
  { x: 190, y: 310, number: "1" },
  { x: 235, y: 310, number: "2" },
  { x: 280, y: 310, number: "3" },
  { x: 148, y: 270, number: "4" },
  { x: 148, y: 225, number: "5" },
  { x: 148, y: 180, number: "6" },
  { x: 180, y: 145, number: "7" },
  { x: 225, y: 145, number: "8" },
  { x: 270, y: 145, number: "9" },
  { x: 270, y: 260, number: "12" },
  { x: 180, y: 260, number: "11" },
  { x: 180, y: 195, number: "10" },
  { x: 270, y: 195, number: "13" },
]

const emit = defineEmits(['seat-selected']);

const selectSeat = (seatNumber) =>{
  emit('seat-selected', seatNumber);
}

</script>

<template>
  <div v-if="seatsStore.loading">
    <v-progress-circular
      indeterminate
      color="primary"
    ></v-progress-circular>
  </div>
  <div v-else>
    <svg width="100%" height="500px" viewBox="0 0 500 500">
      <!-- wall outline -->
      <path d="M0,50 l0,60 l115,0 l0,260 l350,0 l0,-320 l-115,0 l0,60 l-175,0 l0,-60 z" stroke="brown" fill="transparent" stroke-width="5" />
      <!-- door to cr -->
      <path d="M100,50 l0,60" stroke="brown" stroke-width="2" fill="transparent" />
      <!-- counter -->
      <rect x="305" y="112" width="50" height="150" fill="gray" />
      <!-- Tables -->
      <rect x="180" y="112" width="125" height="30" fill="saddlebrown" />
      <rect x="115" y="175" width="30" height="125" fill="saddlebrown" />
      <rect x="210" y="185" width="55" height="45" fill="saddlebrown" />
      <rect x="210" y="250" width="55" height="45" fill="saddlebrown" />
      <rect x="180" y="338" width="135" height="30" fill="saddlebrown" />
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
      <!-- Stairs -->
      <path d="M355,365 l0,-75 l105,0" stroke="black" stroke-dasharray="5,5" fill="transparent"/>
      <!-- <path
        d="
          M363,320
          a35,35 0 1,1 -35,35
          l35,0
          l0,-35
          "
        stroke="black"
        fill="none"
      />
      <path d="M363,355 l-10,35" stroke="blue" fill="none"/> -->
      <!-- texts -->
      <text x="20" y="85" font-size="0.75rem" fill="saddlebrown" font-weight="bold">RESTROOM</text>
      <text x="390" y="330" font-size="0.75rem" fill="saddlebrown" font-weight="bold">STAIRS</text>
      <text x="325" y="140" rotate="90" font-size="1rem" fill="white">C</text>
      <text x="325" y="155" rotate="90" font-size="1rem" fill="white">O</text>
      <text x="325" y="170" rotate="90" font-size="1rem" fill="white">U</text>
      <text x="325" y="185" rotate="90" font-size="1rem" fill="white">N</text>
      <text x="325" y="200" rotate="90" font-size="1rem" fill="white">T</text>
      <text x="325" y="215" rotate="90" font-size="1rem" fill="white">E</text>
      <text x="325" y="230" rotate="90" font-size="1rem" fill="white">R</text>
    </svg>
  </div>
</template>
