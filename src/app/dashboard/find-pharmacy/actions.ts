'use server';
import { db } from '@/firebase/server-init';
import type { Inventory, Pharmacy, PrescribedMedication } from '@/lib/types';
import { getDocs, collection, collectionGroup, query, where } from 'firebase/firestore';

// A type for the result, including pharmacy data and distance
export interface FoundPharmacy {
  pharmacy: Pharmacy;
  distance: number;
}

// Function to get all pharmacies
async function getAllPharmacies(): Promise<Pharmacy[]> {
  const snapshot = await db.collection('pharmacies').get();
  return snapshot.docs.map(doc => doc.data() as Pharmacy);
}

// Function to check inventory for a list of medications in all pharmacies
async function findPharmaciesWithAllMeds(medications: PrescribedMedication[]): Promise<string[]> {
  if (medications.length === 0) {
    return [];
  }

  const medNames = medications.map(med => med.medicationName);
  
  const inventoryQuery = collectionGroup(db, 'inventory');
  const snapshot = await inventoryQuery.where('name', 'in', medNames).get();
  
  const pharmacyInventories: Record<string, Set<string>> = {};
  
  snapshot.docs.forEach(doc => {
    const inventoryItem = doc.data() as Inventory;
    const pharmacyId = inventoryItem.pharmacyId;
    if (!pharmacyInventories[pharmacyId]) {
      pharmacyInventories[pharmacyId] = new Set();
    }
    pharmacyInventories[pharmacyId].add(inventoryItem.name);
  });
  
  const eligiblePharmacyIds: string[] = [];
  for (const pharmacyId in pharmacyInventories) {
    const availableMeds = pharmacyInventories[pharmacyId];
    const hasAllMeds = medNames.every(medName => availableMeds.has(medName));
    if (hasAllMeds) {
      eligiblePharmacyIds.push(pharmacyId);
    }
  }

  return eligiblePharmacyIds;
}

// Haversine formula to calculate distance between two points on Earth
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}


export async function findAndSortPharmacies(
  medications: PrescribedMedication[],
  userLatitude: number,
  userLongitude: number,
): Promise<FoundPharmacy[]> {
    try {
        const [allPharmacies, eligiblePharmacyIds] = await Promise.all([
            getAllPharmacies(),
            findPharmaciesWithAllMeds(medications)
        ]);

        const eligiblePharmacies = allPharmacies.filter(p => eligiblePharmacyIds.includes(p.id));

        const pharmaciesWithDistance: FoundPharmacy[] = eligiblePharmacies.map(pharmacy => {
            const distance = calculateDistance(userLatitude, userLongitude, pharmacy.latitude, pharmacy.longitude);
            return { pharmacy, distance };
        });

        // Sort pharmacies by distance, nearest first
        pharmaciesWithDistance.sort((a, b) => a.distance - b.distance);

        return pharmaciesWithDistance;

    } catch (error) {
        console.error("Error finding pharmacies:", error);
        return [];
    }
}

    