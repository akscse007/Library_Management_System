const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lendRequestController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// student creates request
router.post('/', protect, authorize('student'), ctrl.createRequest);

// list requests (student or manager/librarian/admin)
router.get('/', protect, authorize('student', 'manager', 'librarian', 'admin'), ctrl.listRequests);

// manager / librarian / admin actions
router.post('/:id/approve', protect, authorize('manager', 'librarian', 'admin'), ctrl.approveRequest);
router.post('/:id/reject', protect, authorize('manager', 'librarian', 'admin'), ctrl.rejectRequest);

module.exports = router;
