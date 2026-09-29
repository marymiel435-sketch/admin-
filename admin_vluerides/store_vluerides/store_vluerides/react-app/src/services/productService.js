import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
} from 'firebase/firestore';

import { db } from '../firebase';
import { Product } from '../models/product';
import { FirestoreCollections } from '../utils/constants';
import { StorageService } from './storageService';

function productsRef(storeId) {
  return collection(db, FirestoreCollections.stores, storeId, FirestoreCollections.products);
}

export const ProductService = {
  async getProduct(storeId, productId) {
    const snap = await getDoc(doc(productsRef(storeId), productId));
    return snap.exists() ? Product.fromFirestore(snap) : null;
  },

  // Subscribes to a store's product list; `callback` receives the current
  // Product[]. Returns an unsubscribe function.
  streamProducts(storeId, { availableOnly } = {}, callback) {
    let q = query(productsRef(storeId), orderBy('createdAt', 'desc'));
    if (availableOnly === true) {
      q = query(productsRef(storeId), where('available', '==', true), orderBy('createdAt', 'desc'));
    }
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => Product.fromFirestore(d)));
    });
  },

  // Reserves a product id up front so a photo can be uploaded to a stable
  // storage path before the Firestore doc is written.
  newProductId(storeId) {
    return doc(productsRef(storeId)).id;
  },

  addProduct(storeId, productId, product) {
    return setDoc(doc(productsRef(storeId), productId), product.toCreateMap());
  },

  updateProduct(storeId, productId, fields) {
    return updateDoc(doc(productsRef(storeId), productId), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  },

  toggleAvailability(storeId, productId, available) {
    return this.updateProduct(storeId, productId, { available });
  },

  async deleteProduct(storeId, productId) {
    await StorageService.deleteProductPhoto({ storeId, productId });
    await deleteDoc(doc(productsRef(storeId), productId));
  },
};
