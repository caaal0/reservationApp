import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

async function getUserStats() {

  if(authStore.userRole !== 'admin') {
    return { success: false, error: 'Unauthorized access' };
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`,
    },
  });
  if(response.ok){
    const data = await response.json();
    return data;
  }else{
    return { success: false, error: 'Failed to get user stats' };
  }
}

async function getReservationStats(){

    if(authStore.userRole !== 'admin') {
      return { success: false, error: 'Unauthorized access' };
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/reservation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    });
    if(response.ok){
      const data = await response.json();
      return data;
    }else{
      return { success: false, error: 'Failed to get reservation stats' };
    }
}

export default {
  getUserStats,
  getReservationStats,
}
