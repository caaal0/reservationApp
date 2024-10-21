import { useAuthStore } from '@/stores/auth';

async function createReservation(seatNumber, startTime, endTime){
  try{
    const authStore = useAuthStore();
    const userId = authStore.user?.uid;
    // Check if the user is logged in
    if (!userId) {
      throw new Error("User not logged in");
    }

    const startTimeISO = new Date(startTime).toISOString();
    const endTimeISO = new Date(endTime).toISOString();

    const newReservation = {
      userId: userId,
      seatNo: seatNumber,
      startTime: startTimeISO,
      endTime: endTimeISO,
      status: 'pending',
      actionBy: '',
      createdAt: new Date().toISOString(),
    };

    const response = await fetch('http://localhost:8080/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify(newReservation),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json()
      console.error('Reservation failed');
      alert('Reservation failed');
      return data;
    }

  } catch (error){
    console.error('Error:', error);
    alert('Reservation error.');
    return {success: false, error};
  }
}

async function getApprovedReservations(){
  try{

    const response = await fetch(`http://localhost:8080/reservations/approved`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json()
      console.error('Reservation failed');
      alert('Reservation failed');
      return data;
    }

  } catch (error){
    console.error('Error:', error);
    alert('Reservation error.');
    return {success: false, error};
  }
}

async function getMyPendingReservations(){
  try{
    const authStore = useAuthStore();
    const userId = authStore.user?.uid;
    const response = await fetch(`http://localhost:8080/reservations/pending/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const data = await response.json()
      console.error('Reservation failed');
      alert('Reservation failed');
      return data;
    }
  }catch (error){
    console.error('Error:', error);
    alert('Reservation error.');
    return {success: false, error};
  }
}

async function getMyReservations(){
  try{
    const authStore = useAuthStore();
    const userId = authStore.user?.uid;
    // Check if the user is logged in
    if (!userId) {
      throw new Error("User not logged in");
    }
    console.log(userId);
    const response = await fetch(`http://localhost:8080/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const returnObj = {
        pastReservations: data.data.pastReservations,
        currentReservation: data.data.currentReservation,
      }
      return {success: true, data: returnObj};
    } else {
      const data = await response.json()
      console.error('Failed to get user reservation');
      // alert('Failed to get user reservation');
      return data;
    }
  } catch (error){
    console.error('Error:', error);
    // alert('Error getting user reservation');
    return error;
  }
}

export default { createReservation, getApprovedReservations, getMyPendingReservations, getMyReservations };
