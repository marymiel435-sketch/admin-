// Mirrors lib/models/rider_model.dart
function toDate(ts, fallback) {
  return ts?.toDate ? ts.toDate() : fallback;
}
function toDateOrNull(ts) {
  return ts?.toDate ? ts.toDate() : null;
}

export function riderFromMap(map, id) {
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
    purok: map.purok ?? null,
    barangay: map.barangay ?? null,
    profilePhotoUrl: map.profilePhotoUrl ?? map.profilePicture ?? map.profile_picture ?? map.photoUrl ?? null,
    licenseNumber: map.licenseNumber ?? '',
    licenseExpiry: toDate(map.licenseExpiry, new Date()),
    vehicleType: map.vehicleType ?? 'Motorcycle',
    motorcycleBrand: map.motorcycleBrand ?? '',
    motorcycleModel: map.motorcycleModel ?? '',
    plateNumber: map.plateNumber ?? '',
    vehicleColor: map.vehicleColor ?? '',
    licensePhotoUrl: map.licensePhotoUrl ?? map.licenseImageUrl ?? '',
    orCrPhotoUrl: map.orCrPhotoUrl ?? map.orCrImageUrl ?? '',
    selfieWithLicenseUrl: map.selfieWithLicenseUrl ?? '',
    emailVerified: map.emailVerified ?? false,
    accountStatus: map.accountStatus ?? 'Pending Approval',
    rejectionReason: map.rejectionReason ?? null,
    isOnline: map.isOnline ?? false,
    rating: typeof map.rating === 'number' ? map.rating : 0.0,
    totalDeliveries: typeof map.totalDeliveries === 'number' ? map.totalDeliveries : 0,
    role: map.role ?? 'rider',
    createdAt: toDate(map.createdAt, new Date()),
    updatedAt: toDate(map.updatedAt, new Date()),
    sosActive: map.sosActive ?? false,
    sosAt: toDateOrNull(map.sosAt),
    sosNote: map.sosNote ?? null,
    get isPendingApproval() {
      return this.accountStatus === 'Pending Approval';
    },
    get isDocumentsRequested() {
      return this.accountStatus === 'Documents Requested';
    },
    get isApproved() {
      return this.accountStatus === 'Approved';
    },
    get isSuspended() {
      return this.accountStatus === 'Suspended';
    },
    get isRejected() {
      return this.accountStatus === 'Rejected';
    },
  };
}
