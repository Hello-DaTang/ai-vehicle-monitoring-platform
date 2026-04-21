import type { TelemetrySample, TimeWindow, Vehicle, VehicleEvent } from "./types";

const sampleTimes = [
  "2026-04-21T08:00:00+08:00",
  "2026-04-21T08:15:00+08:00",
  "2026-04-21T08:30:00+08:00",
  "2026-04-21T08:45:00+08:00",
  "2026-04-21T09:00:00+08:00",
  "2026-04-21T09:15:00+08:00",
  "2026-04-21T09:30:00+08:00",
  "2026-04-21T09:45:00+08:00",
  "2026-04-21T10:00:00+08:00",
  "2026-04-21T10:15:00+08:00",
  "2026-04-21T10:30:00+08:00",
  "2026-04-21T10:45:00+08:00",
  "2026-04-21T11:00:00+08:00",
  "2026-04-21T11:15:00+08:00",
  "2026-04-21T11:30:00+08:00",
  "2026-04-21T11:45:00+08:00",
  "2026-04-21T12:00:00+08:00",
];

export const timeWindows: TimeWindow[] = [
  {
    id: "full",
    label: "08:00-12:00 全程",
    start: "2026-04-21T08:00:00+08:00",
    end: "2026-04-21T12:00:00+08:00",
  },
  {
    id: "morning",
    label: "08:00-10:00 早高峰",
    start: "2026-04-21T08:00:00+08:00",
    end: "2026-04-21T10:00:00+08:00",
  },
  {
    id: "incident",
    label: "10:00-11:30 异常聚焦",
    start: "2026-04-21T10:00:00+08:00",
    end: "2026-04-21T11:30:00+08:00",
  },
  {
    id: "latest",
    label: "11:00-12:00 最近一小时",
    start: "2026-04-21T11:00:00+08:00",
    end: "2026-04-21T12:00:00+08:00",
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "veh-001",
    plate: "苏A-D9187",
    vin: "LNAID20260421001",
    model: "N7 纯电重卡",
    group: "南京干线",
    driver: "周明",
    status: "warning",
    riskLevel: "critical",
    lastSeen: "2026-04-21T11:55:00+08:00",
    locationName: "江宁东山",
    odometerKm: 62418,
  },
  {
    id: "veh-002",
    plate: "苏A-P3275",
    vin: "LNAID20260421002",
    model: "N5 城配厢货",
    group: "机场接驳",
    driver: "陈雨",
    status: "online",
    riskLevel: "medium",
    lastSeen: "2026-04-21T12:00:00+08:00",
    locationName: "禄口机场",
    odometerKm: 38506,
  },
  {
    id: "veh-003",
    plate: "苏A-M6112",
    vin: "LNAID20260421003",
    model: "N3 城市配送",
    group: "城市配送",
    driver: "吴桐",
    status: "online",
    riskLevel: "low",
    lastSeen: "2026-04-21T12:00:00+08:00",
    locationName: "河西南",
    odometerKm: 27442,
  },
  {
    id: "veh-004",
    plate: "苏A-K0826",
    vin: "LNAID20260421004",
    model: "N7 纯电重卡",
    group: "电池换电",
    driver: "李航",
    status: "warning",
    riskLevel: "high",
    lastSeen: "2026-04-21T11:50:00+08:00",
    locationName: "栖霞港区",
    odometerKm: 71290,
  },
  {
    id: "veh-005",
    plate: "苏A-H4501",
    vin: "LNAID20260421005",
    model: "N5 城配厢货",
    group: "测试车队",
    driver: "赵寻",
    status: "offline",
    riskLevel: "medium",
    lastSeen: "2026-04-21T09:30:00+08:00",
    locationName: "软件谷",
    odometerKm: 19822,
  },
];

interface SampleProfile {
  vehicleId: string;
  lat: number;
  lng: number;
  socStart: number;
  tempStart: number;
  voltageStart: number;
  bmsStart: number;
  speedBase: number;
  mileageStart: number;
  onlineUntilIndex?: number;
  adjust?: (index: number, sample: TelemetrySample) => TelemetrySample;
}

function buildSamples(profile: SampleProfile): TelemetrySample[] {
  return sampleTimes.map((timestamp, index) => {
    const online =
      profile.onlineUntilIndex === undefined ? true : index <= profile.onlineUntilIndex;
    const sample: TelemetrySample = {
      vehicleId: profile.vehicleId,
      timestamp,
      lat: Number((profile.lat + index * 0.004 + Math.sin(index / 2) * 0.002).toFixed(6)),
      lng: Number((profile.lng + index * 0.006 + Math.cos(index / 3) * 0.002).toFixed(6)),
      speedKph: online ? Math.max(0, Math.round(profile.speedBase + Math.sin(index) * 11)) : 0,
      soc: Number((profile.socStart - index * 1.1).toFixed(1)),
      batteryTempC: Number((profile.tempStart + Math.sin(index / 2) * 1.5).toFixed(1)),
      voltageV: Number((profile.voltageStart - index * 0.8).toFixed(1)),
      currentA: online ? Number((-28 - Math.cos(index / 2) * 9).toFixed(1)) : 0,
      soh: Number((94 - index * 0.04).toFixed(1)),
      insulationKohm: Math.round(620 - index * 3),
      bmsScore: Math.round(profile.bmsStart - index * 0.6),
      mileageKm: Number((profile.mileageStart + index * 2.8).toFixed(1)),
      online,
    };

    return profile.adjust ? profile.adjust(index, sample) : sample;
  });
}

export const telemetrySamples: TelemetrySample[] = [
  ...buildSamples({
    vehicleId: "veh-001",
    lat: 31.9451,
    lng: 118.842,
    socStart: 72,
    tempStart: 32,
    voltageStart: 655,
    bmsStart: 86,
    speedBase: 54,
    mileageStart: 62418,
    adjust: (index, sample) => {
      if (index >= 9) {
        return {
          ...sample,
          batteryTempC: Number((sample.batteryTempC + (index - 8) * 3.2).toFixed(1)),
          soc: Number((sample.soc - (index - 8) * 0.8).toFixed(1)),
          voltageV: Number((sample.voltageV - (index - 8) * 1.6).toFixed(1)),
          insulationKohm: sample.insulationKohm - (index - 8) * 25,
          bmsScore: sample.bmsScore - (index - 8) * 4,
        };
      }
      return sample;
    },
  }),
  ...buildSamples({
    vehicleId: "veh-002",
    lat: 31.7546,
    lng: 118.8647,
    socStart: 66,
    tempStart: 29,
    voltageStart: 642,
    bmsStart: 84,
    speedBase: 42,
    mileageStart: 38506,
    adjust: (index, sample) => {
      if (index === 10 || index === 11) {
        return {
          ...sample,
          online: false,
          speedKph: 0,
          currentA: 0,
          lat: 31.792,
          lng: 118.886,
        };
      }
      return sample;
    },
  }),
  ...buildSamples({
    vehicleId: "veh-003",
    lat: 31.9901,
    lng: 118.7204,
    socStart: 81,
    tempStart: 27,
    voltageStart: 667,
    bmsStart: 92,
    speedBase: 35,
    mileageStart: 27442,
  }),
  ...buildSamples({
    vehicleId: "veh-004",
    lat: 32.1355,
    lng: 118.9022,
    socStart: 58,
    tempStart: 31,
    voltageStart: 638,
    bmsStart: 80,
    speedBase: 46,
    mileageStart: 71290,
    adjust: (index, sample) => {
      if (index >= 7) {
        return {
          ...sample,
          voltageV: Number((sample.voltageV - (index - 6) * 2.5).toFixed(1)),
          insulationKohm: sample.insulationKohm - (index - 6) * 34,
          bmsScore: sample.bmsScore - (index - 6) * 3,
        };
      }
      return sample;
    },
  }),
  ...buildSamples({
    vehicleId: "veh-005",
    lat: 31.9485,
    lng: 118.7593,
    socStart: 44,
    tempStart: 30,
    voltageStart: 621,
    bmsStart: 78,
    speedBase: 28,
    mileageStart: 19822,
    onlineUntilIndex: 6,
  }),
];

export const vehicleEvents: VehicleEvent[] = [
  {
    id: "evt-001",
    vehicleId: "veh-001",
    timestamp: "2026-04-21T10:18:00+08:00",
    type: "battery",
    severity: "warning",
    title: "电池温升异常",
    description: "15分钟内电池温度上升超过 6C，SOC 下降速度同步加快。",
  },
  {
    id: "evt-002",
    vehicleId: "veh-001",
    timestamp: "2026-04-21T10:48:00+08:00",
    type: "bms",
    severity: "critical",
    title: "BMS热失衡风险",
    description: "BMS评分跌破阈值，绝缘阻值连续下降。",
  },
  {
    id: "evt-003",
    vehicleId: "veh-002",
    timestamp: "2026-04-21T10:30:00+08:00",
    type: "connectivity",
    severity: "warning",
    title: "数据上报中断",
    description: "车辆连续两个采样周期未上传有效行驶数据。",
  },
  {
    id: "evt-004",
    vehicleId: "veh-003",
    timestamp: "2026-04-21T09:42:00+08:00",
    type: "driving",
    severity: "info",
    title: "配送任务完成",
    description: "车辆完成河西南片区配送，电池和行驶数据稳定。",
  },
  {
    id: "evt-005",
    vehicleId: "veh-004",
    timestamp: "2026-04-21T09:48:00+08:00",
    type: "bms",
    severity: "warning",
    title: "电压压差扩大",
    description: "包电压下降速度快于同组车辆，建议排查单体一致性。",
  },
  {
    id: "evt-006",
    vehicleId: "veh-004",
    timestamp: "2026-04-21T11:12:00+08:00",
    type: "battery",
    severity: "critical",
    title: "绝缘阻值低",
    description: "绝缘阻值低于 420kOhm，需结合近期涉水和换电记录排查。",
  },
  {
    id: "evt-007",
    vehicleId: "veh-005",
    timestamp: "2026-04-21T09:32:00+08:00",
    type: "connectivity",
    severity: "critical",
    title: "车辆离线",
    description: "车辆最后一次有效上报停留在 09:30，后续无定位与电池数据。",
  },
];
