// Mirrors lib/models/product_model.dart
export function productFromMap(map, id) {
  return {
    id,
    name: map.name ?? '',
    category: map.category ?? '',
    description: map.description ?? null,
    price: typeof map.price === 'number' ? map.price : 0,
    imageUrl: map.imageUrl ?? null,
    available: map.available ?? true,
    createdAt: map.createdAt?.toDate ? map.createdAt.toDate() : new Date(),
    updatedAt: map.updatedAt?.toDate ? map.updatedAt.toDate() : new Date(),
  };
}
