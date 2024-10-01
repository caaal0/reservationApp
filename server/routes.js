import index from './controllers/index.js';
import reservations from './controllers/reservations.js';
import seats from './controllers/seats.js';
import users from './controllers/users.js';
import auth from './controllers/auth.js';

import express from 'express';

const router = express.Router();

router.get('/', index.homePage);
//User authentication
router.post('/signup', auth.signup);
// router.post('/login', auth.login);

// Reservation management
router.get('/reservations', reservations.getReservations);
router.get('/reservations/pending', reservations.getPendingReservations);
router.put('/reservations/:id&:action', reservations.actionReservation);
router.get('/reservations/:id', reservations.getReservation);
router.post('/reservations', reservations.createReservation);
router.put('/reservations/:id', reservations.updateReservation);
router.delete('/reservations/:id', reservations.deleteReservation);
//Seat management
router.get('/seats', seats.getSeats);
router.get('/seats/:seatNo', seats.getSeat);
// User management
router.get('/users', users.getCustomers);
router.delete('/users/:customerID', users.deleteCustomer);
router.post('/staffs', users.createStaff);
router.delete('/staffs/:staffID', users.deleteStaff);

export default router;