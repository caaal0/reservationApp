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
  { x: 148, y: 270, number: "37" },
  { x: 148, y: 225, number: "38" },
  { x: 148, y: 180, number: "39" },
  { x: 195, y: 145, number: "40" },
  { x: 250, y: 145, number: "41" },
  { x: 305, y: 145, number: "42" },
  { x: 405, y: 310, number: "43" },
  { x: 350, y: 310, number: "44" },
  { x: 295, y: 310, number: "45" },
  { x: 240, y: 310, number: "46" },
  { x: 185, y: 310, number: "47" },
  { x: 237, y: 272, number: "48" },
  { x: 282, y: 272, number: "49" },
  { x: 330, y: 225, number: "50" },
  { x: 282, y: 180, number: "51" },
  { x: 237, y: 180, number: "52" },
  { x: 190, y: 225, number: "53" },
  { x: 380, y: 205, number: "54" },
  { x: 380, y: 160, number: "55" },
  { x: 430, y: 270, number: "58" },
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
    <!-- door to cr -->
    <path d="M100,50 l0,60" stroke="brown" stroke-width="2" fill="transparent" />
    <!-- Tables -->
    <rect x="172.5" y="112" width="180" height="30" fill="saddlebrown" />
    <rect x="115" y="175" width="30" height="125" fill="saddlebrown" />
    <rect x="220" y="208" width="105" height="60" fill="saddlebrown" />
    <rect x="180" y="340" width="265" height="28" fill="saddlebrown" />
    <rect x="410" y="130" width="55" height="125" fill="saddlebrown" />
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
    <!-- special seats, drawn differently 56 & 57 -->
    <g>
      <rect
        x="420"
        y="130"
        width="43"
        height="125"
        :fill="availableSeats.includes('56') ? 'green' : 'red'"
        @click="selectSeat('56')"
        style="cursor: pointer"
        />
        <text
        x="432"
        y="195"
        font-size="10"
        fill="white"
        text-anchor="middle"
      >56</text>
    </g>
    <g>
      <rect
        x="440"
        y="130"
        width="23"
        height="125"
        :fill="availableSeats.includes('57') ? 'green' : 'red'"
        @click="selectSeat('57')"
        style="cursor: pointer"
        />
        <text
        x="452"
        y="195"
        font-size="10"
        fill="white"
        text-anchor="middle"
      >57</text>
    </g>
    <!-- texts -->
    <text x="20" y="85" font-size="0.75rem" fill="saddlebrown" font-weight="bold">RESTROOM</text>
    <text x="380" y='85' font-size="0.75rem" fill="saddlebrown" font-weight="bold">KITCHEN</text>
  </svg>
</template>
