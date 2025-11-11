// FIX: The original file content was a placeholder string, causing multiple 'Cannot find name' and 'is not a module' errors across the application.
// This file has been populated with the necessary type definitions used throughout the app.
import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export enum UserRole {
  ADMIN = 'admin',
  ATTENDANT = 'attendant',
  CUSTOMER = 'customer',
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  isVerified: boolean;
}

export interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'unverified' | 'needs-profile';
  user: User | null;
  profile: UserProfile | null;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: Timestamp;
}

// --- New types for Statistics Page ---
export enum FuelType {
    GASOLINE = 'Gasoline',
    DIESEL = 'Diesel',
    ELECTRIC = 'Electric (per kWh)'
}

export interface FuelPrice {
    type: FuelType;
    price: number;
    change: number; // positive for increase, negative for decrease
}

export interface FuelTank {
    type: FuelType;
    level: number; // current level in gallons
    capacity: number; // max capacity in gallons
}

export interface ProfitDataPoint {
    day: string;
    profit: number; // in percentage
}

// --- New types for Fraud Detection ---
export interface Vehicle {
  uid: string;
  ownerName: string;
  fridNumber: string;
  plateNumber: string;
  vehicleModel: string;
  registeredAt: Timestamp;
  tankCapacity: number; // in liters
  fuelEfficiency: number; // in km/L
}

export interface FuelLog {
    id: string;
    vehicleId: string;
    fridNumber: string;
    odometer: number; // in km
    litersAdded: number;
    fuelGaugeOnArrival: number; // As a percentage (0-100)
    fuelType: FuelType;
    totalPrice: number;
    timestamp: Timestamp;
    attendantId: string;
    attendantName: string;
    fraudCheckResult: 'normal' | 'fraud' | 'pending';
    paymentMethod: 'cash' | 'telebirr' | 'card';
    customerName?: string;
    customerEmail?: string;
}