const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Students list is used by manager, librarian and accountant dashboards
router.get(
  '/students',
  protect,
  authorize('manager', 'librarian', 'accountant', 'admin'),
  managerController.getStudents
);

// Only managerial roles can change account status
router.patch(
  '/students/:id/status',
  protect,
  authorize('manager', 'librarian', 'admin'),
  managerController.updateStatus
);

// Fines overview for manager/accountant dashboard KPIs
router.get(
  '/fines/overview',
  protect,
  authorize('manager', 'accountant', 'admin'),
  managerController.finesOverview
);

module.exports = router;
