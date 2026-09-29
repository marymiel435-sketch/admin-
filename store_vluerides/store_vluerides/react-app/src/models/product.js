import { serverTimestamp } from 'firebase/firestore';

export class Product {
  constructor({
    id,
    name,
    description = null,
    price,
    bulkPrice = null,
    packSize = null,
    category,
    imageUrl = null,
    available,
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    // Optional price for a pack unit. Null when the merchant doesn't sell
    // this product by the pack.
    this.bulkPrice = bulkPrice;
    // Optional number of pieces contained in a pack. Null when not specified.
    this.packSize = packSize;
    this.category = category;
    this.imageUrl = imageUrl;
    this.available = available;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromFirestore(docSnap) {
    const data = docSnap.data();
    return new Product({
      id: docSnap.id,
      name: data.name ?? '',
      description: data.description ?? null,
      price: Number(data.price ?? 0),
      bulkPrice: data.bulkPrice != null ? Number(data.bulkPrice) : null,
      packSize: data.packSize != null ? Math.trunc(Number(data.packSize)) : null,
      category: data.category ?? '',
      imageUrl: data.imageUrl ?? null,
      available: data.available ?? true,
      createdAt: data.createdAt?.toDate?.() ?? null,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    });
  }

  toCreateMap() {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      bulkPrice: this.bulkPrice,
      packSize: this.packSize,
      category: this.category,
      imageUrl: this.imageUrl,
      available: this.available,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  }
}
