const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');

router.get('/students', managerController.getStudents);
router.patch('/students/:id/status', managerController.updateStatus);
router.get('/fines/overview', managerController.finesOverview);

module.exports = router;
