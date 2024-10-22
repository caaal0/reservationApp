<script setup>
import { ref, computed } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import reservationHelper from '../firebase/reservationsHelper'
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore()
const reservationDialog = ref(false)
const step = ref(1) // Tracks the current step of the reservation process
// User choices
const selectedDay = ref(null)
const selectedTime = ref(null)
const selectedOption = ref(null)
const visibleSnackbar = ref(false)
//TODO: optimize with lazy loading per week
//get the approved reservations from the database and display them on the calendar
async function loadEvents() {
  //for approved reservations
  const approvedReservations = await reservationHelper.getApprovedReservations()
  if(approvedReservations.success){
    //load events into the calendar when the proper seat is selected
    for(let reservation of approvedReservations.data){
      if(reservation.seatNo == props.selectedSeat) {
        const newEvent = {
        title: `Reserved`,
        start: new Date(reservation.startTime),
        end: new Date(reservation.endTime),
        allDay: false,
        class: 'reserved',
        }
        events.value.push(newEvent)
      }
    }
  }else{
    console.log(approvedReservations.error)
    alert("Error loading events")
  }
  //to get this user's pending reservations
  if(authStore.user){
    const myPendingReservations = await reservationHelper.getMyPendingReservations()
    if(myPendingReservations.success){
      for(let reservation of myPendingReservations.data){
        if(reservation.seatNo == props.selectedSeat) {
          const newEvent = {
          title: `Requested`,
          start: new Date(reservation.startTime),
          end: new Date(reservation.endTime),
          allDay: false,
          class: 'requested',
          }
          events.value.push(newEvent)
        }
      }
    }else{
      console.log(myPendingReservations.error)
      // alert("Error loading events")
    }
  }
}
loadEvents()

const emit = defineEmits(['close'])

const props = defineProps({
  selectedSeat: String,
})

function showSnackbar() {
  visibleSnackbar.value = true
}

function openReservationDialog() {
  if(!authStore.user){
    alert("Please login to make a reservation")
    return
  }
  reservationDialog.value = true;
}

function onCellClick(event) {
  // alert(event)
  const clickedDate = new Date(event);
  // Extract the year, month, and day in local time
  const year = clickedDate.getFullYear();
  const month = String(clickedDate.getMonth() + 1).padStart(2, '0'); // getMonth is 0-indexed
  const day = String(clickedDate.getDate()).padStart(2, '0');

  // Combine into "YYYY-MM-DD" format
  selectedDay.value = `${year}-${month}-${day}`;
}

function nextStep() {
  step.value += 1
}

function prevStep() {
  step.value -= 1
}

function calculateEndTime() {
  const durationInHours = parseInt(selectedOption.value);
  const startTime = new Date(`${selectedDay.value}T${selectedTime.value}`)
  const endTime = new Date(startTime)
  endTime.setHours(startTime.getHours() + durationInHours)

  return {startTime, endTime}
}

function createEvent(startTime, endTime) {
  //create new event and push to events array
  const newEvent = {
    title: `Requested`,
    start: startTime,
    end: endTime,
    allDay: false,
    class: 'requested',
  }
  events.value.push(newEvent)
}

function resetSteps() {
  step.value = 1;
  selectedDay.value = null;
  selectedTime.value = null;
  selectedOption.value = null;
}

async function finishReservation() {
  reservationDialog.value = false;
  console.log("Date:", selectedDay.value)
  console.log("Time:", selectedTime.value)
  console.log("Option:", selectedOption.value)
  const {startTime, endTime} = calculateEndTime()
  //call firebase function to send data to the database
  const msg = await reservationHelper.createReservation(props.selectedSeat, startTime, endTime)
  if(msg.success){
    console.log("Reservation created successfully")
    //create event on the calendar
    createEvent(startTime, endTime)
    resetSteps()
    showSnackbar()
  } else {
    console.log(msg.error)
    alert("Error creating reservation")
  }
}

const minDate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
})

const events = ref([])

const specialHours = {
  // 7: {
  //   from: 0 * 60,
  //   to: 24 * 60,
  //   class: 'closed',
  //   label: 'Closed'
  // },
}

</script>
<template>
  <v-card>
    <v-card-title class="text-center">Booking Calendar for Seat {{selectedSeat}}</v-card-title>
    <v-btn icon="$close" variant="text" @click="emit('close')" class="close-btn" density="compact">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-card-text class="justify-center">
      <div class="scroll-container">
        <div class="calendar-wrapper">
          <vue-cal
            class="vuecal--green-theme"
            active-view="week"
            :min-cell-width="125"
            :snap-to-time="30"
            :disable-views="['day', 'month', 'year', 'years']"
            :min-date="minDate"
            :time-step="60"
            :special-hours="specialHours ? specialHours : {}"
            :cell-click-hold="false"
            :drag-to-create-event="false"
            :editable-events="{ title: false, drag: true, resize: false, delete: true, create: true }"
            :events="events"
            hide-view-selector
            show-time-in-cells
            />
        </div>
      </div>
    </v-card-text>
    <v-btn
      icon="$plus"
      variant="text"
      class="event-create-btn"
      @click="openReservationDialog"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-dialog v-model="reservationDialog" max-width="350" @update:model-value="resetSteps">
      <v-card v-if="step === 1" class="text-center">
        <v-card-title>Pick a date</v-card-title>
        <v-card-text class="justify-center">
          <div class="date-picker">
            <vue-cal
              class="vuecal--date-picker vuecal--green-theme"
              xsmall
              hide-view-selector
              height="200"
              :time="false"
              :transitions="false"
              :min-date="minDate"
              active-view="month"
              :disable-views="['week']"
              @cell-click="onCellClick"
              :dblclick-to-navigate="false"
              style="width: 210px;height: 230px">
            </vue-cal>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="reservationDialog = false">Cancel</v-btn>
          <v-btn text @click="nextStep" :disabled="!selectedDay">Next</v-btn>
        </v-card-actions>
      </v-card>
      <!-- Step 2: Pick a Time -->
    <v-card v-if="step === 2">
      <v-card-title class="text-center">Pick a start time</v-card-title>
      <v-card-text class="justify-center">
        <!-- Vuetify Time Picker -->
        <v-time-picker
          v-model="selectedTime"
          full-width
          height="500"
          width="350"
          color="green-lighten-1x"
          format="24hr"
        />
      </v-card-text>
      <v-card-actions class="d-flex justify-between">
        <v-btn text @click="prevStep">Back</v-btn>
        <v-btn text @click="nextStep" :disabled="!selectedTime">Next</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Step 3: Choose an Option -->
    <v-card v-if="step === 3">
      <v-card-title class="text-center">How many hours?</v-card-title>
      <v-card-text class="justify-center">
        <!-- Vuetify Radio Button Group -->
        <v-radio-group v-model="selectedOption" column>
          <v-radio label="1 Hour" value="1"></v-radio>
          <v-radio label="3 Hours" value="3"></v-radio>
          <v-radio label="5 Hours" value="5"></v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions class="d-flex justify-between">
        <v-btn text @click="prevStep">Back</v-btn>
        <v-btn text @click="finishReservation" :disabled="!selectedOption">Finish</v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
  </v-card>
  <v-snackbar v-model="visibleSnackbar" color="green-darken-1" timeout="3000">
    Reservation created successfully!
    <template v-slot:actions>
      <v-btn
          color="white"
          variant="text"
          @click="visibleSnackbar = false"
        >
          Close
        </v-btn>
    </template>
  </v-snackbar>
</template>

<style>
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background-color: var(--red-light);
  transition: background-color 0.3s ease, color 0.3s ease;
}
.close-btn:hover {
  background-color: transparent;
}

.close-btn .v-icon {
  color: white;
}
.close-btn .v-icon:hover {
  color: var(--brown-dark);
}

.event-create-btn {
  position: absolute;
  bottom: 40px;
  right: 45px;
  z-index: 10;
  background-color: var(--green-medium);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.event-create-btn:hover {
  background-color: var(--green-dark);
}

.event-create-btn .v-icon {
  color: white;
}

v-card {
  width:auto;
}

.scroll-container {
  overflow-x: auto; /* Enables horizontal scrolling */
  white-space: nowrap; /* Prevents content from wrapping */
  max-width: 100%; /* Ensure it doesn't go beyond its container */
  max-height: 500px;
}

.calendar-wrapper {
  display: inline-block; /* Ensures calendar content stays on a single line */
}

.closed {
  background:
    #fff7f0
    repeating-linear-gradient(
      -45deg,
      rgba(255, 162, 87, 0.25),
      rgba(255, 162, 87, 0.25) 5px,
      rgba(255, 255, 255, 0) 5px,
      rgba(255, 255, 255, 0) 15px
    );
  color: #f6984c;
}

.vuecal__no-event {
  display: none;
}

.date-picker {
  display: flex; /* Align content centrally */
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

v-card-actions v-btn v-icon {
  color: var(--green-dark);
}

.requested {
  background-color: var(--red-medium);
  color: white;
  font-size: 0.8rem;
}

.reserved {
  background-color: var(--green-medium);
  color: white;
  font-size: 0.8rem;
}
</style>
