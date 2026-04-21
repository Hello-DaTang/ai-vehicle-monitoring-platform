export type VehicleStatus = "online" | "offline" | "warning";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type EventSeverity = "info" | "warning" | "critical";

export type EventType = "driving" | "battery" | "bms" | "connectivity" | "gps";

export interface Vehicle {
  id: string;
  plate: string;
  vin: string;
  model: string;
  group: string;
  driver: string;
  status: VehicleStatus;
  riskLevel: RiskLevel;
  lastSeen: string;
  locationName: string;
  odometerKm: number;
}

export interface TelemetrySample {
  vehicleId: string;
  timestamp: string;
  lat: number;
  lng: number;
  speedKph: number;
  soc: number;
  batteryTempC: number;
  voltageV: number;
  currentA: number;
  soh: number;
  insulationKohm: number;
  bmsScore: number;
  mileageKm: number;
  online: boolean;
}

export interface VehicleEvent {
  id: string;
  vehicleId: string;
  timestamp: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
}

export interface TimeWindow {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface DiagnosticInsight {
  id: string;
  severity: RiskLevel;
  title: string;
  summary: string;
  likelyCause: string;
  affectedSignals: string[];
  evidence: string[];
  nextChecks: string[];
}

export interface VehicleFilters {
  search: string;
  status: "all" | VehicleStatus;
  riskLevel: "all" | RiskLevel;
  group: "all" | string;
}

export interface FleetSummary {
  total: number;
  online: number;
  offline: number;
  warnings: number;
  activeAlerts: number;
  averageSoc: number | null;
}

export interface WindowComparison {
  socDelta: number | null;
  tempDelta: number | null;
  mileageDelta: number | null;
  bmsScoreDelta: number | null;
}
