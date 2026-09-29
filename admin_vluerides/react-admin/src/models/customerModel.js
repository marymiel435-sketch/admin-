// Mirrors lib/models/customer_model.dart
function toDate(ts, fallback) {
  return ts?.toDate ? ts.toDate() : fallback;
}

export function customerFromMap(map, id) {
  const firstName = map.firstName ?? '';
  const lastName = map.lastName ?? '';
  return {
    uid: map.uid ?? id,
    firstName,
    middleName: map.middleName ?? null,
    lastName,
    suffix: map.suffix ?? null,
    fullName: map.fullName ?? `${firstName} ${lastName}`.trim(),
    dateOfBirth: toDate(map.dateOfBirth, new Date(2000, 0, 1)),
    gender: map.gender ?? '',
    phoneNumber: map.phoneNumber ?? map.phone ?? '',
    email: map.email ?? '',
    username: map.username ?? '',
    homeAddress: map.homeAddress ?? map.address ?? '',
    latitude: typeof map.latitude === 'number' ? map.latitude : null,
    longitude: typeof map.longitude === 'number' ? map.longitude : null,
    profileImage: map.profileImage ?? map.profilePicture ?? map.profile_picture ?? map.photoUrl ?? '',
    emailVerified: map.emailVerified ?? false,
    isOnline: map.isOnline ?? map.is_online ?? map.online ?? false,
    accountStatus: map.accountStatus ?? 'Active',
    createdAt: toDate(map.createdAt, new Date()),
    updatedAt: toDate(map.updatedAt, new Date()),
  };
}
