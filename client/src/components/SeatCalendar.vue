<script setup>
import { ref, computed, onMounted } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import reservationHelper from '../firebase/reservationsHelper'
import usersHelper from '../firebase/usersHelper'
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore()
const reservationDialog = ref(false)
const step = ref(1) // Tracks the current step of the reservation process
const customers = ref([])
const finalizeReservation = ref(false)  // Dialog to confirm reservation details

const showHint = ref(true)

// User choices
const selectedDay = ref(null)
const selectedTime = ref(null)
const selectedOption = ref(null)

const snackBarMsg = ref('');
const snackBarSuccess = ref(true);
const showSnackbar = ref(false);
//for admin to book for a customer
const customerSelected = ref(null)

const events = ref([])
const finishedLoadingEvents = ref(false)

async function loadCustomers(){
  try{
    const response = await usersHelper.getCustomers()
    if(response.success){
      customers.value = response.data
    }else{
      console.log(response.error)
      // alert("Error loading customers")
      snackBarMsg.value = "Error loading customers"
      snackBarSuccess.value = false
      showSnackbar.value = true
    }
  }catch(error){
    // console.log(error)
    // alert("Error loading customers")
    console.error(error)
    snackBarMsg.value = "Error loading customers"
    snackBarSuccess.value = false
    showSnackbar.value = true
  }
}

//TODO: optimize with lazy loading per week
//get the approved reservations from the database and display them on the calendar
async function loadEvents() {
  //TODO: fix getting events from the database
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
    console.log(approvedReservations.error);
    if(approvedReservations.error == "No approved reservations"){
      console.log("No approved reservations")
    }else{
      alert("Error loading events")
    }
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
  finishedLoadingEvents.value = true
  setTimeout(() => {
    showHint.value = false
  }, 3000)
}
// loadEvents()

const emit = defineEmits(['close'])

const props = defineProps({
  selectedSeat: String,
})


function openReservationDialog() {
  if(!authStore.user){
    // alert("Please login to make a reservation")
    snackBarMsg.value = "Please login to make a reservation"
    snackBarSuccess.value = false
    showSnackbar.value = true
    return
  }else if(authStore.userRole === 'customer' && authStore.currentReservation != ''){
    // alert("You already have a reservation")
    snackBarMsg.value = "You already have a reservation"
    snackBarSuccess.value = false
    showSnackbar.value = true
    return
  }
  reservationDialog.value = true;
}

//function to handle cell click on date-picker
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
    class: customerSelected.value!=null? 'reserved':'requested',
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
  // console.log("Date:", selectedDay.value)
  // console.log("Time:", selectedTime.value)
  // console.log("Option:", selectedOption.value)
  const {startTime, endTime} = calculateEndTime()
  //before creating the reservation, check if it overlaps with any other reservation
  //times can overlap on the same minute only
  for(let event of events.value){
    if(event.start < startTime && event.end > startTime){
      // alert("Reservation overlaps with another reservation")
      snackBarMsg.value = "Reservation overlaps with another reservation"
      snackBarSuccess.value = false
      showSnackbar.value = true
      return
    }
    if(event.start < endTime && event.end > endTime){
      // alert("Reservation overlaps with another reservation")
      snackBarMsg.value = "Reservation overlaps with another reservation"
      snackBarSuccess.value = false
      showSnackbar.value = true
      return
    }
    if(event.start > startTime && event.end < endTime){
      // alert("Reservation overlaps with another reservation")
      snackBarMsg.value = "Reservation overlaps with another reservation"
      snackBarSuccess.value = false
      showSnackbar.value = true
      return
    }
    if(event.start < startTime && event.end > endTime){
      // alert("Reservation overlaps with another reservation")
      snackBarMsg.value = "Reservation overlaps with another reservation"
      snackBarSuccess.value = false
      showSnackbar.value = true
      return
    }
    if(event.start > startTime && event.end < endTime){
      // alert("Reservation overlaps with another reservation")
      snackBarMsg.value = "Reservation overlaps with another reservation"
      snackBarSuccess.value = false
      showSnackbar.value = true
      return
    }
  }
  //call firebase function to send data to the database
  let temp_msg = null
  let msg = null
  if(authStore.userRole === 'admin' || authStore.userRole === 'staff'){
    //also send the customer object, and the admin or staff id with
    const adminStaffId=authStore.user?.uid
    const customerObj = customers.value.find(customer => customer.userId === customerSelected.value)
    //this will receive the reservation obj
    temp_msg = await reservationHelper.createReservation(props.selectedSeat, startTime, endTime, customerObj, adminStaffId)
    msg = await reservationHelper.actionReservation(temp_msg.data.reservationId, 'approved', adminStaffId)
  }else{
    msg = await reservationHelper.createReservation(props.selectedSeat, startTime, endTime)
  }
  if(msg.success){
    // console.log("Reservation created successfully")
    //create event on the calendar
    createEvent(startTime, endTime)
    snackBarMsg.value = authStore.userRole ==='customer'? "Request sent! You can view your request in \"My Reservations\"":"Reservation created successfully"
    snackBarSuccess.value = true

    // analyticsHelper.trackReservationEvent(props.selectedSeat, selectedOption.value, startTime, endTime, authStore.userRole != 'customer'? true:false)
    resetSteps()
  } else {
    //TODO: error snackbar
    console.log(msg.error)
    // alert("Error creating reservation")
    snackBarMsg.value = "Error creating reservation"
    snackBarSuccess.value = false
  }
  showSnackbar.value = true
  reservationDialog.value = false;
}

const minDate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
})

const maxDate = computed(() => {
  const today = new Date();
  // today.setHours(0, 0, 0, 0);
  if(authStore.userRole === 'customer'){
    today.setDate(today.getDate() + 28);
  }
  return today;
})

const today = computed (() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const y = today.getFullYear();
  const m = today.getMonth()+1;
  var d = today.getDate();
  if(d < 10){
    d = '0'+d;
  }
  const day = `${y}-${m}-${d}`
  // console.log(day)
  if(selectedDay.value == day){
    // console.log('true')
    return true;
  }else{
    return false;
  }
  // return today;
})

const getCurrentTime = computed(() => {
  const hours = new Date().getHours();
  const minutes = new Date().getMinutes();
  return `${hours}:${minutes}`;
})

const canFinishReservation = computed(() => {
  if(authStore.userRole === 'admin' || authStore.userRole === 'staff'){
    return selectedDay.value && selectedTime.value && selectedOption.value && customerSelected.value
  }else{
    return selectedDay.value && selectedTime.value && selectedOption.value
  }
})

const specialHours = {
  // 7: {
  //   from: 0 * 60,
  //   to: 24 * 60,
  //   class: 'closed',
  //   label: 'Closed'
  // },
}

onMounted(async () => {
  // console.log('Mounted')
  loadEvents()
  if(authStore.userRole === 'admin' || authStore.userRole === 'staff'){
    // console.log('Admin')
    // console.log(customers)
    await loadCustomers()
    customers.value = customers.value.filter(customer => customer.currentReservation === '')
  }
})

</script>
<template>
  <v-card>
    <v-card-title class="text-center">Booking Calendar for Seat {{selectedSeat}}</v-card-title>
    <v-btn icon="$close" variant="text" @click="emit('close')" class="close-btn" density="compact">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-card-text class="justify-center">
      <div class="scroll-container">
        <div v-if="finishedLoadingEvents" class="calendar-wrapper">
          <vue-cal
            class="vuecal--green-theme"
            active-view="week"
            :min-cell-width="125"
            :snap-to-time="30"
            :disable-views="['day', 'month', 'year', 'years']"
            :min-date="minDate"
            :max-date="maxDate"
            :time-step="60"
            :special-hours="specialHours ? specialHours : {}"
            :cell-click-hold="false"
            :drag-to-create-event="false"
            :editable-events="{ title: false, drag: false, resize: false, delete: false, create: true }"
            :events="events"
            hide-view-selector
            show-time-in-cells
            />
            <!-- button to reserve a timeslot shows a tooltip for 3 seconds -->
            <v-btn
              icon="$plus"
              variant="text"
              class="event-create-btn"
              @click="openReservationDialog"
            >
              <v-icon>mdi-plus</v-icon>
              <v-tooltip activator="parent" v-model="showHint" location="start">
                Click here to reserve!
              </v-tooltip>
            </v-btn>
          </div>
          <div v-else class="d-flex justify-center">
            <v-progress-circular
              indeterminate
              color="green"
            ></v-progress-circular>
        </div>
      </div>
    </v-card-text>
    <v-dialog v-model="reservationDialog" max-width="370" @update:model-value="resetSteps">
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
              :max-date="maxDate"
              active-view="month"
              :disable-views="['week']"
              @cell-click="onCellClick"
              :dblclick-to-navigate="false"
              style="width: 210px;height: 230px">
            </vue-cal>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="error" @click="reservationDialog = false">Cancel</v-btn>
          <v-btn text color="#6b8d71" @click="nextStep" :disabled="!selectedDay">Next</v-btn>
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
          width="320"
          :min="today? getCurrentTime : '00:00'"
          color="#6b8d71"
          format="ampm"
          :ampm-in-title='true'
        />
      </v-card-text>
      <v-card-actions class="d-flex justify-between">
        <v-btn text color="#6b8d71" @click="prevStep">Back</v-btn>
        <v-btn text color="#6b8d71" @click="nextStep" :disabled="!selectedTime">Next</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Step 3: Choose an Option -->
    <v-card v-if="step === 3">
      <v-card-title class="text-center">How many hours?</v-card-title>
      <v-card-text class="justify-center">
        <!-- Vuetify Radio Button Group -->
        <v-radio-group v-model="selectedOption" column color="#6b8d71">
          <v-radio label="1 Hour" value="1"></v-radio>
          <v-radio label="3 Hours" value="3"></v-radio>
          <v-radio label="5 Hours" value="5"></v-radio>
        </v-radio-group>
        <!-- if admin, add option to book for a customer -->
        <v-autocomplete
          v-if="authStore.user && (authStore.userRole === 'admin' || authStore.userRole === 'staff')"
          v-model="customerSelected"
          :items="customers"
          item-title="name"
          item-value="userId"
          label="Book for customer"
          dense
          hide-details
          clearable
          variant="outlined"
          auto-select-first="true"
        >
        </v-autocomplete>
      </v-card-text>
      <v-card-actions class="d-flex justify-between">
        <v-btn text color="#6b8d71" @click="prevStep">Back</v-btn>
        <v-btn text color="#6b8d71" @click="finalizeReservation = true" :disabled="!canFinishReservation">Finish</v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="finalizeReservation" persistent max-width="300">
      <v-card>
        <v-card-title>Confirm Reservation</v-card-title>
        <v-card-text>
          <p><strong>Confirm the following details:</strong></p>
          <p>Seat: {{selectedSeat}}</p>
          <p>Day: {{selectedDay}}</p>
          <p>Time: {{selectedTime}}</p>
          <p>Duration: {{selectedOption}} hours</p>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="error" @click="finalizeReservation = false">Cancel</v-btn>
          <v-btn text color="#6b8d71" @click="finishReservation">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </v-dialog>
  </v-card>
  <v-snackbar v-model="showSnackbar" :color="snackBarSuccess? 'green':'red'" timeout="3000">
    {{ snackBarMsg }}
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
