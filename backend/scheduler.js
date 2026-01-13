const cron = require('node-cron');
const Borrow = require('./models/Borrow');
const Fine = require('./models/Fine');
const calcFine = require('./utils/calcFine');

console.log('[SCHEDULER] Initializing fine calculation scheduler...');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('[SCHEDULER] Running daily fine calculation...');

  try {
    // Find all issued borrows that are overdue
    const overdueBorrows = await Borrow.find({
      status: 'issued',
      dueAt: { $lt: new Date() }
    }).populate('student book');

    console.log(`[SCHEDULER] Found ${overdueBorrows.length} overdue borrows`);

    for (const borrow of overdueBorrows) {
      // Check if fine already exists for this borrow
      const existingFine = await Fine.findOne({
        borrowId: borrow._id,
        status: { $ne: 'waived' } // Don't create if already waived
      });

      if (existingFine) {
        console.log(`[SCHEDULER] Fine already exists for borrow ${borrow._id}`);
        continue;
      }

      // Calculate fine amount
      const amount = calcFine(borrow.issuedAt, new Date(), 2, 15); // 2 Rs per day, 15 free days

      if (amount > 0) {
        const fine = await Fine.create({
          borrowId: borrow._id,
          userId: borrow.student._id,
          reason: 'Overdue book return',
          issuedDate: borrow.dueAt,
          dueDate: borrow.dueAt, // Due immediately
          amount,
          status: 'unpaid'
        });

        console.log(`[SCHEDULER] Created fine ${fine._id} for borrow ${borrow._id}, amount: ${amount}`);
      }
    }

    console.log('[SCHEDULER] Daily fine calculation completed');
  } catch (err) {
    console.error('[SCHEDULER] Error in fine calculation:', err);
  }
});

console.log('[SCHEDULER] Fine calculation scheduler initialized (runs daily at midnight)');
