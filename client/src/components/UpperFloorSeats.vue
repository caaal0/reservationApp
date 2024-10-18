<script setup>
import { ref } from 'vue';
import { useSeatsStore } from '@/stores/seats';

const seatsStore = useSeatsStore();
const availableSeats = ref([]);

watchEffect(() => {
  if(seatsStore.loading) {
    console.log('Loading seats');
  } else {
    console.log(seatsStore.seats);
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
  console.log(availableSeats.value);
}
// Seats positions with numbers
const seats = ref([
  { x: 280, y: 310, number: "14" },
  { x: 235, y: 310, number: "15" },
  { x: 190, y: 310, number: "16" },
  { x: 145, y: 310, number: "17" },
  { x: 122, y: 242, number: "18" },
  { x: 162, y: 242, number: "19" },
  { x: 207, y: 242, number: "20" },
  { x: 247, y: 242, number: "21" },
  { x: 287, y: 242, number: "22" },
  { x: 287, y: 168, number: "23" },
  { x: 247, y: 168, number: "24" },
  { x: 207, y: 168, number: "25" },
  { x: 162, y: 168, number: "26" },
  { x: 122, y: 168, number: "27" },
  { x: 80, y: 74, number: "28" },
  { x: 45, y: 74, number: "29" },
  { x: 10, y: 74, number: "30" },
  { x: 220, y: 115, number: "31" },
  { x: 285, y: 115, number: "32" },
  { x: 375, y: 65, number: "33" },
  { x: 403, y: 148, number: "34" },
  { x: 403, y: 193, number: "35" },
  { x: 403, y: 238, number: "36" },
]);

const emit = defineEmits(['seat-selected']);

const selectSeat = (seatNumber) =>{
  emit('seat-selected', seatNumber);
}
</script>

<template>
  <svg width="100%" height="500px" viewBox="0 0 500 500">
    <!-- wall outline -->
    <path d="M0,50 l0,60 l115,0 l0,260 l350,0 l0,-320 l-115,0 l0,60 l-175,0 l0,-60 z" stroke="brown" fill="transparent" stroke-width="5" />
    <!-- Tables -->
    <rect x="1" y="52" width="110" height="20" fill="saddlebrown" />
    <circle cx="265" cy="125" r="15" fill="saddlebrown" />
    <rect x="352" y="52" width="20" height="50" fill="saddlebrown" />
    <rect x="433" y="140" width="30" height="135" fill="saddlebrown" />
    <rect x="116" y="195" width="205" height="45" fill="saddlebrown" />
    <rect x="130" y="338" width="200" height="30" fill="saddlebrown" />
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
    <text x="390" y="330" font-size="0.75rem" fill="saddlebrown" font-weight="bold">STAIRS</text>
  </svg>
</template>
