/**
 * Convert hari ke format bulan + hari
 * contoh:
 * 1  -> 1 hari
 * 30 -> 1 bulan
 * 65 -> 2 bulan 5 hari
 */
export function formatExpired(days) {
  const month = Math.floor(days / 30);
  const day = days % 30;

  const result = [];
  if (month > 0) result.push(`${month} bulan`);
  if (day > 0) result.push(`${day} hari`);

  return result.join(" ") || "0 hari";
}

/**
 * Generate expired metadata
 */
export function generateExpired(days) {
  const createdAt = Date.now();
  const expiredAt = createdAt + days * 24 * 60 * 60 * 1000;

  return {
    days,
    text: formatExpired(days),
    created_at: createdAt,
    expired_at: expiredAt
  };
}