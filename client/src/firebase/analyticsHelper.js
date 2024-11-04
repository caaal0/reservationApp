import { app } from "./firebase";
import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from "firebase/analytics";

const analytics = getAnalytics(app);
setAnalyticsCollectionEnabled(analytics, true);

async function trackReservationEvent(seatNumber, duration, startTime, endTime, walkIn=false){
  logEvent(analytics, 'reservation', {
    seatNumber: seatNumber,
    duration: duration,
    startTime: startTime,
    endTime: endTime,
    walkIn: walkIn
  });
}

export default {
  trackReservationEvent,
 };
