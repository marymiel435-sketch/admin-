// A single purok (village subdivision) entry within a barangay.
export class Purok {
  constructor({ barangay, purok, latitude, longitude }) {
    this.barangay = barangay;
    this.purok = purok;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  // Shown in the location dropdown and stored as the search display string.
  get label() {
    return `${this.purok}, Brgy. ${this.barangay}`;
  }

  toString() {
    return this.label;
  }
}
