<script setup>
import { onMounted, ref } from 'vue'
</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Staff Dashboard</h1>
      </v-col>
    </v-row>
    <!-- row of cards -->
    <v-row>
      <v-col cols="12" md="3" sm="6">
        <v-card hover to="/staff/reservations" image="..\..\assets\vecteezy_calendar-line-icon-set-vector-calendar-schedule-symbols_6225832.svg">
          <v-card-title>Reservations</v-card-title>
          <v-card-text>

          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" sm="6">
        <v-card hover to="/staff/users" image="..\..\assets\vecteezy_two-people-icon-in-trendy-flat-style-isolated-on-white_10287602.svg">
          <v-card-title>Users</v-card-title>
          <v-card-text>

          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" sm="6">
        <v-card hover to="/staff/walkins" image="..\..\assets\vecteezy_simple-and-modern-style-flat-design-edit-icon-isolated-on-a_7164151.svg">
          <v-card-title>Walk-ins</v-card-title>
          <v-card-text>

          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
.v-card {
  max-width: 100%;
  height: 200px;
  cursor: pointer;
}

.v-card-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--brown-dark);
}

h1 {
  color: var(--green-medium);
}
</style>
