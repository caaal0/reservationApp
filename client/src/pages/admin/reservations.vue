<script setup>
import { onMounted, ref } from 'vue'
import reservationsHelper from '../../firebase/reservationsHelper.js';

const showPastReservations = ref(true);
const showTodayReservations = ref(false);
const showPendingReservations = ref(false);

const reservations = ref([]);

// Fetch reservations
const fetchReservations = async () => {
  try {
    const data = await reservationsHelper.getReservations();
    reservations.value = data.data;
  } catch (error) {
    console.error('Error:', error);
  }
}

onMounted(() => {
  fetchReservations();
  console.log('Reservations:', reservations.value);
});

</script>

<template>
  <v-container>
    <v-row>
      <v-col class="column-container">
        <!-- this div will contain the checkboxes filters? -->
        <div class="filters">
          <v-row justify="space-between">
            <v-checkbox color="green" v-model="showPastReservations" label="Show Past Reservations"></v-checkbox>
            <v-checkbox color="green" v-model="showTodayReservations" label="Show Today's Reservations"></v-checkbox>
            <v-checkbox color="green" v-model="showPendingReservations" label="Show Pending Reservations"></v-checkbox>
            <!-- <v-col>
            </v-col> -->
          </v-row>
        </div>
        <div class="reservations-wrapper">

        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.filters {
  margin-top: 1rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  overflow-x: auto; /* Enables horizontal scrolling */
}

.reservations-wrapper {
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  scrollbar-gutter: stable; /* Adds stable spacing for scrollbar */
  gap: 1rem;
  overflow-y: auto; /* Enables vertical scrolling */
  max-height: 500px; /* Adjust based on your layout needs */
}

/* Optional: Hide default scrollbar and style */
.filters::-webkit-scrollbar,
.reservations-wrapper::-webkit-scrollbar {
  display: none; /* Hide default scrollbar */
}

.filters,
.reservations-wrapper {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
