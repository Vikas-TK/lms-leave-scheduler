export function seedAttendance(rollNo, dept) {
  if (!rollNo || !dept) return 78;
  const n = (parseInt(rollNo || "1", 10) + dept.charCodeAt(0)) % 20;
  return 78 + n; // Returns a number between 78 and 97
}
