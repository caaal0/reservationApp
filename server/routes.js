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
router.post('/login', auth.login);

// Reservation management
router.get('/reservations', reservations.getReservations);
router.get('/reservations/approved', reservations.getApprovedReservations);
router.get('/reservations/pending', reservations.getPendingReservations);
router.get('/reservations/pending/:id', reservations.getMyPendingReservations);
router.get('/reservations/current', reservations.getMyCurrentReservation);
router.put('/reservations/:action', reservations.actionReservation);
router.get('/reservations/:id', reservations.getReservation);
router.post('/reservations', reservations.createReservation);
router.put('/reservations/:id', reservations.updateReservation);
router.delete('/reservations/:id', reservations.deleteReservation);
//Seat management
router.get('/seats', seats.getSeats);
router.get('/seats/:seatNo', seats.getSeat);
// User management
router.get('/users', users.getCustomers);
router.post('/users/:customerID', users.createCustomerDoc);
router.get('/users/:customerID', users.getCustomer);
router.delete('/users/:customerID', users.deleteCustomer);
router.get('/staffs', users.getStaffs);
router.post('/staffs', users.createStaff);
router.delete('/staffs/:staffID', users.deleteStaff);

export default router;