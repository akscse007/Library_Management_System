// Fine calculation: no fine for first `freeDays` days from borrow start,
// then `perDayRate` (default Rs.2) for each overdue day.
// borrowedAt: Date the book was issued
// returnedAt: Date the book was returned (or now)
module.exports = function calcFine(borrowedAt, returnedAt, perDayRate = 2, freeDays = 15) {
  if (!borrowedAt) return 0;
  const start = new Date(borrowedAt);
  const ret = returnedAt ? new Date(returnedAt) : new Date();
  if (ret <= start) return 0;

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.ceil((ret - start) / msPerDay);
  const overdueDays = Math.max(0, totalDays - freeDays);
  return overdueDays * perDayRate;
};
