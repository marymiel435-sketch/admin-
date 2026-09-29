// Mirrors lib/models/admin_model.dart
export function adminFromMap(map, id) {
  const createdAt = map.createdAt?.toDate ? map.createdAt.toDate() : new Date();
  return {
    id,
    email: map.email ?? '',
    name: map.name ?? '',
    role: map.role ?? 'admin',
    photoUrl: map.photoUrl ?? null,
    phone: map.phone ?? null,
    createdAt,
  };
}
