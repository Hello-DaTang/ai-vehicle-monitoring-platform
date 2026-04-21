import type {
  DiagnosticInsight,
  EventSeverity,
  FleetSummary,
  RiskLevel,
  TelemetrySample,
  TimeWindow,
  Vehicle,
  VehicleEvent,
  VehicleFilters,
  WindowComparison,
} from "./types";

const riskRank: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const severityRank: Record<EventSeverity, number> = {
  info: 1,
  warning: 2,
  critical: 3,
};

function toTime(value: string): number {
  return new Date(value).getTime();
}

export function isInsideWindow(timestamp: string, window: TimeWindow): boolean {
  const time = toTime(timestamp);
  return time >= toTime(window.start) && time <= toTime(window.end);
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export function getGroups(vehicles: Vehicle[]): string[] {
  return Array.from(new Set(vehicles.map((vehicle) => vehicle.group))).sort();
}

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  const query = filters.search.trim().toLowerCase();

  return vehicles
    .filter((vehicle) => {
      const queryMatches =
        query.length === 0 ||
        [vehicle.plate, vehicle.vin, vehicle.model, vehicle.group, vehicle.driver]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const statusMatches = filters.status === "all" || vehicle.status === filters.status;
      const riskMatches =
        filters.riskLevel === "all" || vehicle.riskLevel === filters.riskLevel;
      const groupMatches = filters.group === "all" || vehicle.group === filters.group;

      return queryMatches && statusMatches && riskMatches && groupMatches;
    })
    .sort((a, b) => riskRank[b.riskLevel] - riskRank[a.riskLevel]);
}

export function getSamplesForWindow(
  samples: TelemetrySample[],
  vehicleId: string,
  window: TimeWindow,
): TelemetrySample[] {
  return samples
    .filter((sample) => sample.vehicleId === vehicleId && isInsideWindow(sample.timestamp, window))
    .sort((a, b) => toTime(a.timestamp) - toTime(b.timestamp));
}

export function getEventsForWindow(
  events: VehicleEvent[],
  vehicleId: string,
  window: TimeWindow,
): VehicleEvent[] {
  return events
    .filter((event) => event.vehicleId === vehicleId && isInsideWindow(event.timestamp, window))
    .sort((a, b) => toTime(a.timestamp) - toTime(b.timestamp));
}

export function getLatestSample(samples: TelemetrySample[]): TelemetrySample | undefined {
  return [...samples].sort((a, b) => toTime(b.timestamp) - toTime(a.timestamp))[0];
}

export function calculateFleetSummary(
  visibleVehicles: Vehicle[],
  samples: TelemetrySample[],
  events: VehicleEvent[],
  window: TimeWindow,
): FleetSummary {
  const visibleIds = new Set(visibleVehicles.map((vehicle) => vehicle.id));
  const latestSamples = visibleVehicles
    .map((vehicle) => getLatestSample(getSamplesForWindow(samples, vehicle.id, window)))
    .filter((sample): sample is TelemetrySample => Boolean(sample));

  const socValues = latestSamples.map((sample) => sample.soc);
  const activeAlerts = events.filter(
    (event) =>
      visibleIds.has(event.vehicleId) &&
      isInsideWindow(event.timestamp, window) &&
      event.severity !== "info",
  ).length;

  return {
    total: visibleVehicles.length,
    online: visibleVehicles.filter((vehicle) => vehicle.status === "online").length,
    offline: visibleVehicles.filter((vehicle) => vehicle.status === "offline").length,
    warnings: visibleVehicles.filter((vehicle) => vehicle.status === "warning").length,
    activeAlerts,
    averageSoc:
      socValues.length === 0
        ? null
        : Number((socValues.reduce((sum, value) => sum + value, 0) / socValues.length).toFixed(1)),
  };
}

export function getWindowComparison(samples: TelemetrySample[]): WindowComparison {
  if (samples.length < 2) {
    return {
      socDelta: null,
      tempDelta: null,
      mileageDelta: null,
      bmsScoreDelta: null,
    };
  }

  const first = samples[0];
  const last = samples[samples.length - 1];

  return {
    socDelta: Number((last.soc - first.soc).toFixed(1)),
    tempDelta: Number((last.batteryTempC - first.batteryTempC).toFixed(1)),
    mileageDelta: Number((last.mileageKm - first.mileageKm).toFixed(1)),
    bmsScoreDelta: Number((last.bmsScore - first.bmsScore).toFixed(1)),
  };
}

export function filterEventsBySeverity(
  events: VehicleEvent[],
  severity: "all" | EventSeverity,
): VehicleEvent[] {
  if (severity === "all") {
    return events;
  }

  return events.filter((event) => event.severity === severity);
}

export function buildDiagnostics(
  vehicle: Vehicle,
  samples: TelemetrySample[],
  events: VehicleEvent[],
): DiagnosticInsight[] {
  if (samples.length === 0) {
    return [
      {
        id: `${vehicle.id}-no-data`,
        severity: vehicle.status === "offline" ? "medium" : "low",
        title: vehicle.status === "offline" ? "当前时段缺少有效上报" : "当前时段暂无可分析数据",
        summary:
          vehicle.status === "offline"
            ? "该车在所选时间窗内没有可用遥测，需要先确认通信链路。"
            : "所选时间窗没有命中该车样本，暂不生成异常判断。",
        likelyCause: vehicle.status === "offline" ? "终端离线、网络覆盖不足或车辆停放断电。" : "时间窗与车辆活动时段不重合。",
        affectedSignals: ["在线状态", "GPS", "电池遥测"],
        evidence: [`最后上报：${formatDateTime(vehicle.lastSeen)}`],
        nextChecks: ["确认车辆终端供电", "查看通信平台心跳", "扩大时间窗重新分析"],
      },
    ];
  }

  const first = samples[0];
  const last = samples[samples.length - 1];
  const maxTemp = Math.max(...samples.map((sample) => sample.batteryTempC));
  const minInsulation = Math.min(...samples.map((sample) => sample.insulationKohm));
  const minBmsScore = Math.min(...samples.map((sample) => sample.bmsScore));
  const minVoltage = Math.min(...samples.map((sample) => sample.voltageV));
  const socDrop = Number((first.soc - last.soc).toFixed(1));
  const tempRise = Number((last.batteryTempC - first.batteryTempC).toFixed(1));
  const offlineCount = samples.filter((sample) => !sample.online).length;
  const criticalEvents = events.filter((event) => event.severity === "critical");
  const warningEvents = events.filter((event) => event.severity === "warning");
  const insights: DiagnosticInsight[] = [];

  if (maxTemp >= 48 || (tempRise >= 7 && minBmsScore <= 70)) {
    insights.push({
      id: `${vehicle.id}-thermal`,
      severity: maxTemp >= 52 || criticalEvents.some((event) => event.type === "bms") ? "critical" : "high",
      title: "电池热风险需要优先排查",
      summary: `所选时段最高温度 ${maxTemp.toFixed(1)}C，温升 ${tempRise.toFixed(1)}C，BMS最低评分 ${minBmsScore}。`,
      likelyCause: "高负载行驶、散热效率下降或电池包局部热失衡。",
      affectedSignals: ["电池温度", "SOC", "BMS评分", "绝缘阻值"],
      evidence: [
        `最高电池温度：${maxTemp.toFixed(1)}C`,
        `SOC下降：${socDrop.toFixed(1)}%`,
        `最低BMS评分：${minBmsScore}`,
        `相关事件：${[...criticalEvents, ...warningEvents].map((event) => event.title).join("、") || "无事件上报"}`,
      ],
      nextChecks: ["核对冷却系统工作状态", "查看单体温差和风扇/水泵记录", "必要时安排车辆降载或回站检测"],
    });
  }

  if (offlineCount >= 2 || events.some((event) => event.type === "connectivity")) {
    insights.push({
      id: `${vehicle.id}-connectivity`,
      severity: offlineCount >= 3 || criticalEvents.some((event) => event.type === "connectivity") ? "high" : "medium",
      title: "数据链路存在连续缺口",
      summary: `所选时段有 ${offlineCount} 个采样点未在线，轨迹和电池判断可能不完整。`,
      likelyCause: "车载终端网络弱、网关重启或车辆进入低覆盖区域。",
      affectedSignals: ["在线状态", "GPS轨迹", "数据完整性"],
      evidence: [
        `离线采样点：${offlineCount}/${samples.length}`,
        `最后样本：${formatDateTime(last.timestamp)}`,
      ],
      nextChecks: ["检查终端心跳日志", "对比基站覆盖和车辆位置", "将缺口时段标记为低置信分析"],
    });
  }

  if (minInsulation < 430 || minVoltage < first.voltageV - 18 || minBmsScore < 66) {
    insights.push({
      id: `${vehicle.id}-bms`,
      severity: minInsulation < 390 ? "high" : "medium",
      title: "BMS健康指标走弱",
      summary: `最低绝缘阻值 ${minInsulation}kOhm，最低电压 ${minVoltage.toFixed(1)}V，BMS最低评分 ${minBmsScore}。`,
      likelyCause: "电池包一致性下降、绝缘风险升高或近期工况冲击较大。",
      affectedSignals: ["绝缘阻值", "总压", "BMS评分"],
      evidence: [
        `绝缘阻值最低：${minInsulation}kOhm`,
        `总压变化：${first.voltageV.toFixed(1)}V -> ${last.voltageV.toFixed(1)}V`,
        `BMS评分变化：${first.bmsScore} -> ${last.bmsScore}`,
      ],
      nextChecks: ["调取单体电压压差", "核查换电/维修记录", "复测绝缘并观察下个任务周期"],
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: `${vehicle.id}-stable`,
      severity: "low",
      title: "当前窗口未发现显著风险",
      summary: "车辆在所选时间窗内在线稳定，电池温度、SOC、绝缘和BMS评分处于原型阈值内。",
      likelyCause: "常规运行状态。",
      affectedSignals: ["在线状态", "电池温度", "SOC", "BMS评分"],
      evidence: [
        `最高电池温度：${maxTemp.toFixed(1)}C`,
        `SOC下降：${socDrop.toFixed(1)}%`,
        `最低绝缘阻值：${minInsulation}kOhm`,
      ],
      nextChecks: ["继续观察下一时间窗", "若任务强度提高，可关注温度变化斜率"],
    });
  }

  return insights.sort((a, b) => riskRank[b.severity] - riskRank[a.severity]);
}

export function sortEventsBySeverity(events: VehicleEvent[]): VehicleEvent[] {
  return [...events].sort((a, b) => {
    const severityDiff = severityRank[b.severity] - severityRank[a.severity];
    return severityDiff || toTime(b.timestamp) - toTime(a.timestamp);
  });
}

export function getRiskClass(level: RiskLevel | EventSeverity): string {
  if (level === "critical") {
    return "danger";
  }
  if (level === "high" || level === "warning") {
    return "warn";
  }
  if (level === "medium") {
    return "attention";
  }
  return "ok";
}
