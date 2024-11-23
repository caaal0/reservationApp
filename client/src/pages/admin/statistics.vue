<script setup>
import { onMounted, ref } from 'vue'
import reservationsHelper from '../../firebase/statsHelper.js';

const loading = ref(true);

const userStats = ref(null);
const reservationStats = ref(null);

const monthUserStats = ref(null);
const monthReservationStats = ref(null);

async function loadStats() {
  loading.value = true;
  try {
    //get everything
    let userStatsResponse = await reservationsHelper.getUserStats();
    userStats.value = userStatsResponse.data;
    let reservationStatsResponse = await reservationsHelper.getReservationStats();
    reservationStats.value = reservationStatsResponse.data;

    //get the current month's stats
    let currentMonth = new Date().toISOString().slice(0, 7);
    monthUserStats.value = userStats.value.find(stat => stat.id === currentMonth);
    monthReservationStats.value = reservationStats.value.find(stat => stat.id === currentMonth);
    console.log(monthReservationStats.value);

  } catch (error) {
    console.error('Error:', error);
  }
  loading.value = false;
}

const modeSignUpDay = computed (() => {
  if (monthUserStats.value.signUpDays) {
    let counts = {};
    monthUserStats.value.signUpDays.forEach(day => {
      counts[day] = (counts[day] || 0) + 1;
    });
    // console.log(counts)
    let max = Math.max(...Object.values(counts));
    let mode = Object.keys(counts).find(key => counts[key] === max);
    return mode;
  }
  return 'No data yet';
});

const modeLogInDay = computed (() => {
  if (monthUserStats.value.logInDays) {
    let counts = {};
    monthUserStats.value.logInDays.forEach(day => {
      counts[day] = (counts[day] || 0) + 1;
    });
    // console.log(counts)
    let max = Math.max(...Object.values(counts));
    let mode = Object.keys(counts).find(key => counts[key] === max);
    return mode;
  }
  return 'No data yet';
});

const topFiveSeats = computed (() => {
  if (monthReservationStats.value.requestedSeat) {
    let counts = {};
    monthReservationStats.value.requestedSeat.forEach(seat => {
      counts[seat] = (counts[seat] || 0) + 1;
    });
    // console.log(counts)
    let sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    let topFive = sorted.slice(0, 5).map(seat => seat[0]);
    return topFive.join(', ');
  }
  return 'No data yet';
});

const topThreeWeekDays = computed (() => {
  if(monthReservationStats.value.requestedTime){
    let counts = {};
    monthReservationStats.value.requestedTime.forEach(time => {
      let day = new Date(time).getDay();
      counts[day] = (counts[day] || 0) + 1;
    });
    // console.log(counts);
    let sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    // console.log(sorted);
    let topThree = sorted.slice(0, 3).map(day => {
      switch (day[0]) {
        case '0':
          return 'Sunday';
        case '1':
          return 'Monday';
        case '2':
          return 'Tuesday';
        case '3':
          return 'Wednesday';
        case '4':
          return 'Thursday';
        case '5':
          return 'Friday';
        case '6':
          return 'Saturday';
      }
    });
    console.log(topThree);
    return topThree.join(', ');
  }
  return 'No data yet';
});

const timeOfTheDay = computed (() => {
  if(monthReservationStats.value.requestedTime){
    let counts = {};
    monthReservationStats.value.requestedTime.forEach(time => {
      let hour = new Date(time).getHours();
      let range = hour < 12 && hour > 6 ? 'Morning' : hour > 12 && hour < 17 ? 'Afternoon' : hour > 17 && hour < 19 ? 'Evening' : 'Night';
      counts[range] = (counts[range] || 0) + 1;
    });
    // console.log(counts);
    let sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    // console.log(sorted);
    let topThree = sorted.slice(0, 3).map(hour => hour[0]);
    // console.log(topThree);
    return topThree.join(', ');
  }
  return 'No data yet';
})


onMounted(async () => {
  await loadStats();
});

</script>

<template>
  <v-container>
    <h1>Statistics</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Current Month Users</v-card-title>
          <v-card-text>
            <v-col v-if="loading" class="text-center">
              <v-progress-circular
              indeterminate
              color="green"
              ></v-progress-circular>
            </v-col>
            <div v-else>
              <p>This month's new users: <strong>{{ monthUserStats.signUpCount }}</strong></p>
              <p>Times users have logged in: <strong>{{ monthUserStats.logInCount }}</strong></p>
              <p>A lot of users signed up during this day: <strong> {{new Date().toISOString().slice(0,7)}}-{{ modeSignUpDay }}</strong></p>
              <p>A lot of users logged in during this day: <strong> {{new Date().toISOString().slice(0,7)}}-{{ modeLogInDay }}</strong></p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Current Month Reservations</v-card-title>
          <v-card-text>
            <v-col v-if="loading" class="text-center">
              <v-progress-circular
              indeterminate
              color="green"
              ></v-progress-circular>
            </v-col>
            <div v-else>
              <p>We received this amount of requests this month: <strong>{{monthReservationStats.requests}}</strong></p>
              <p>Approved reservations: <strong>{{monthReservationStats.approved}}</strong></p>
              <p>Rejected reservations: <strong>{{monthReservationStats.rejected}}</strong></p>
              <p>Cancelled reservations: <strong>{{monthReservationStats.cancelled}}</strong></p>
              <p>Customers seem to prefer these seats: <strong>{{ topFiveSeats }}</strong></p>
              <p>Customers seem to prefer these days: <strong>{{ topThreeWeekDays }}</strong></p>
              <p>Customers seem to prefer these times: <strong>{{ timeOfTheDay }}</strong></p>
              <p class="legend">*Morning = 6AM - 12PM</p>
              <p class="legend">*Afternoon = 12PM - 5PM</p>
              <p class="legend">*Evening = 5PM - 7PM</p>
              <p class="legend">*Night = 7PM - 6AM</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

.v-card-title{
  font-size: 1.5rem;
  font-weight: bold;
}

.v-card-text{
  font-size: 1.2rem;
}

strong {
  color:'green-darken-1';
}

.legend {
  font-size: 0.8rem;
  color: 'gray';
}
</style>
