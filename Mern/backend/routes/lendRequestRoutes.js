const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lendRequestController');

// student creates request
router.post('/', ctrl.createRequest);

// list requests (student or manager)
router.get('/', ctrl.listRequests);

// manager actions
router.post('/:id/approve', ctrl.approveRequest);
router.post('/:id/reject', ctrl.rejectRequest);

module.exports = router;
