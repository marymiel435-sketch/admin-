import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '../firebase';
import { StoragePaths } from '../utils/constants';

function extensionFor(contentType) {
  switch (contentType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/jpeg':
    default:
      return 'jpg';
  }
}

async function upload({ path, bytes, contentType }) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, bytes, { contentType });
  return getDownloadURL(storageRef);
}

export const StorageService = {
  uploadPermitPhoto({ uid, bytes, contentType }) {
    const ext = extensionFor(contentType);
    const path = `${StoragePaths.permitPhoto(uid)}/permit_${Date.now()}.${ext}`;
    return upload({ path, bytes, contentType });
  },

  // Fixed filename so re-uploading overwrites the previous store photo.
  uploadStorePhoto({ uid, bytes, contentType }) {
    const ext = extensionFor(contentType);
    const path = `${StoragePaths.storePhoto(uid)}/store_photo.${ext}`;
    return upload({ path, bytes, contentType });
  },

  uploadSubscriptionProof({ uid, bytes, contentType }) {
    const ext = extensionFor(contentType);
    const path = `${StoragePaths.subscriptionProof(uid)}/proof_${Date.now()}.${ext}`;
    return upload({ path, bytes, contentType });
  },

  uploadProductPhoto({ storeId, productId, bytes, contentType }) {
    const ext = extensionFor(contentType);
    const path = `${StoragePaths.productPhoto(storeId, productId)}/photo.${ext}`;
    return upload({ path, bytes, contentType });
  },

  // Best-effort cleanup when a product is deleted; the exact extension
  // used at upload time isn't tracked, so try the common ones and ignore
  // not-found errors.
  async deleteProductPhoto({ storeId, productId }) {
    for (const ext of ['jpg', 'png', 'webp', 'gif']) {
      const storageRef = ref(storage, `${StoragePaths.productPhoto(storeId, productId)}/photo.${ext}`);
      try {
        await deleteObject(storageRef);
      } catch (e) {
        if (e?.code !== 'storage/object-not-found') throw e;
      }
    }
  },
};
