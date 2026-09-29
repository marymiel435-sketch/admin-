import * as firestoreService from '../services/firestoreService';

// Mirrors lib/repositories/customer_repository.dart
export function streamCustomers(onData, onError) {
  return firestoreService.streamCustomers(onData, onError);
}

export function getCustomer(id) {
  return firestoreService.getCustomer(id);
}

export function suspendCustomer(id) {
  return firestoreService.updateCustomerStatus(id, 'Suspended');
}

export function activateCustomer(id) {
  return firestoreService.updateCustomerStatus(id, 'Active');
}

export function deleteCustomer(id) {
  return firestoreService.deleteCustomer(id);
}
