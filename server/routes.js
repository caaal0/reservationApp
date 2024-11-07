import index from './controllers/index.js';
import reservations from './controllers/reservations.js';
import seats from './controllers/seats.js';
import users from './controllers/users.js';
import auth from './controllers/auth.js';

import express from 'express';

const router = express.Router();

router.get('/api/', index.homePage);
//User authentication
router.post('/api/signup', auth.signup);
router.post('/api/login', auth.login);

// Reservation management
router.get('/api/reservations', reservations.getReservations);
router.get('/api/reservations/approved', reservations.getApprovedReservations);
router.get('/api/reservations/pending', reservations.getPendingReservations);
router.get('/api/reservations/pending/:id', reservations.getMyPendingReservations);
router.get('/api/reservations/current', reservations.getMyCurrentReservation);
router.put('/api/reservations/:action', reservations.actionReservation);
router.put('/api/reservations/cancel/:id', reservations.requestCancelReservation);
router.get('/api/reservations/:id', reservations.getReservation);
router.post('/api/reservations', reservations.createReservation);
router.put('/api/reservations/:id', reservations.updateReservation);
router.delete('/api/reservations/:id', reservations.deleteReservation);
//Seat management
router.get('/api/seats', seats.getSeats);
router.get('/api/seats/:seatNo', seats.getSeat);
// User management
router.get('/api/users', users.getCustomers);
router.post('/api/users/:customerID', users.createCustomerDoc);
router.get('/api/users/:customerID', users.getCustomer);
router.delete('/api/users/:customerID', users.deleteCustomer);
router.get('/api/staffs', users.getStaffs);
router.get('/api/staffs/:staffID', users.getStaff);
router.post('/api/staffs', users.createStaff);
router.delete('/api/staffs/:staffID', users.deleteStaff);

export default router;