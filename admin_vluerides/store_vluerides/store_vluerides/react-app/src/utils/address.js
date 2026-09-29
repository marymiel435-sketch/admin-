// Composes the Firestore-facing `address` string from a selected
// purok/barangay plus optional free-text details (street, landmark, etc).
export function composeTrentoAddress({ purok, barangay, details }) {
  const parts = [];
  const trimmedDetails = (details ?? '').trim();
  if (trimmedDetails !== '') parts.push(trimmedDetails);
  if ((purok ?? '') !== '') parts.push(purok);
  if ((barangay ?? '') !== '') parts.push(`Brgy. ${barangay}`);
  parts.push('Trento, Agusan del Sur');
  return parts.join(', ');
}
