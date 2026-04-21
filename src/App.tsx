import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Brain,
  Clock3,
  Filter,
  MapPin,
  RadioTower,
  Route as RouteIcon,
  Search,
  Signal,
} from "lucide-react";
import {
  buildDiagnostics,
  calculateFleetSummary,
  filterEventsBySeverity,
  filterVehicles,
  formatDateTime,
  formatTime,
  getEventsForWindow,
  getGroups,
  getLatestSample,
  getRiskClass,
  getSamplesForWindow,
  getWindowComparison,
} from "./analytics";
import { telemetrySamples, timeWindows, vehicleEvents, vehicles } from "./data";
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
  VehicleStatus,
  WindowComparison,
} from "./types";

const statusLabels: Record<VehicleStatus, string> = {
  online: "在线",
  offline: "离线",
  warning: "预警",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "低",
  medium: "中",
  high: "高",
  critical: "紧急",
};

const severityLabels: Record<EventSeverity, string> = {
  info: "记录",
  warning: "预警",
  critical: "严重",
};

function formatPercent(value: number | null): string {
  return value === null ? "--" : `${value.toFixed(1)}%`;
}

function formatDelta(value: number | null, suffix: string): string {
  if (value === null) {
    return "数据不足";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${suffix}`;
}

function SummaryCard({
  icon,
  label,
  value,
  meta,
  tone = "neutral",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  meta: string;
  tone?: "neutral" | "ok" | "warn" | "danger";
}) {
  return (
    <section className={`summary-card ${tone}`}>
      <div className="summary-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{meta}</span>
      </div>
    </section>
  );
}

function FleetHeader({ summary, window }: { summary: FleetSummary; window: TimeWindow }) {
  return (
    <div className="fleet-header">
      <div>
        <p className="eyebrow">NANJIN AIDONG OPS</p>
        <h1>AI车辆数据实时监测平台</h1>
      </div>
      <div className="summary-grid">
        <SummaryCard
          icon={<RadioTower size={20} />}
          label="车辆总览"
          value={`${summary.total} 辆`}
          meta={`在线 ${summary.online} / 预警 ${summary.warnings} / 离线 ${summary.offline}`}
          tone="neutral"
        />
        <SummaryCard
          icon={<AlertTriangle size={20} />}
          label="活跃告警"
          value={`${summary.activeAlerts} 条`}
          meta={window.label}
          tone={summary.activeAlerts > 1 ? "warn" : "ok"}
        />
        <SummaryCard
          icon={<BatteryCharging size={20} />}
          label="平均SOC"
          value={formatPercent(summary.averageSoc)}
          meta="按当前筛选车辆计算"
          tone={summary.averageSoc !== null && summary.averageSoc < 55 ? "warn" : "ok"}
        />
      </div>
    </div>
  );
}

function FilterPanel({
  filters,
  groups,
  onChange,
}: {
  filters: VehicleFilters;
  groups: string[];
  onChange: (filters: VehicleFilters) => void;
}) {
  return (
    <section className="panel filter-panel">
      <div className="panel-title">
        <Filter size={18} />
        <h2>车辆筛选</h2>
      </div>
      <label className="search-field">
        <Search size={16} />
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="搜索车牌、VIN、司机或车型"
        />
      </label>
      <div className="filter-grid">
        <label>
          状态
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({ ...filters, status: event.target.value as VehicleFilters["status"] })
            }
          >
            <option value="all">全部</option>
            <option value="online">在线</option>
            <option value="warning">预警</option>
            <option value="offline">离线</option>
          </select>
        </label>
        <label>
          风险
          <select
            value={filters.riskLevel}
            onChange={(event) =>
              onChange({ ...filters, riskLevel: event.target.value as VehicleFilters["riskLevel"] })
            }
          >
            <option value="all">全部</option>
            <option value="critical">紧急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </label>
        <label>
          分组
          <select
            value={filters.group}
            onChange={(event) => onChange({ ...filters, group: event.target.value })}
          >
            <option value="all">全部</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function VehicleList({
  vehicles,
  selectedVehicleId,
  onSelect,
}: {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="panel vehicle-list-panel">
      <div className="panel-title">
        <Signal size={18} />
        <h2>车辆队列</h2>
      </div>
      {vehicles.length === 0 ? (
        <EmptyState title="无匹配车辆" text="调整筛选条件后继续查看。" />
      ) : (
        <div className="vehicle-list">
          {vehicles.map((vehicle) => (
            <button
              className={`vehicle-row ${vehicle.id === selectedVehicleId ? "selected" : ""}`}
              key={vehicle.id}
              onClick={() => onSelect(vehicle.id)}
              type="button"
            >
              <span className={`status-dot ${vehicle.status}`} />
              <span className="vehicle-main">
                <strong>{vehicle.plate}</strong>
                <span>{vehicle.model}</span>
                <small>{vehicle.group} / {vehicle.driver}</small>
              </span>
              <span className={`risk-pill ${getRiskClass(vehicle.riskLevel)}`}>
                {riskLabels[vehicle.riskLevel]}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function TimeWindowControl({
  windows,
  activeWindowId,
  onChange,
}: {
  windows: TimeWindow[];
  activeWindowId: string;
  onChange: (id: string) => void;
}) {
  return (
    <section className="panel compact-panel">
      <div className="panel-title">
        <Clock3 size={18} />
        <h2>时间窗</h2>
      </div>
      <div className="segmented">
        {windows.map((window) => (
          <button
            className={window.id === activeWindowId ? "active" : ""}
            key={window.id}
            onClick={() => onChange(window.id)}
            type="button"
          >
            {window.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function VehicleContext({
  vehicle,
  latestSample,
}: {
  vehicle?: Vehicle;
  latestSample?: TelemetrySample;
}) {
  if (!vehicle) {
    return (
      <section className="panel context-panel">
        <EmptyState title="未选择车辆" text="当前筛选结果为空。" />
      </section>
    );
  }

  return (
    <section className="panel context-panel">
      <div className="selected-title">
        <div>
          <p className="eyebrow">当前车辆</p>
          <h2>{vehicle.plate}</h2>
          <span>{vehicle.model} / {vehicle.vin}</span>
        </div>
        <span className={`risk-pill ${getRiskClass(vehicle.riskLevel)}`}>
          {riskLabels[vehicle.riskLevel]}风险
        </span>
      </div>
      <div className="context-grid">
        <div>
          <small>状态</small>
          <strong>{statusLabels[vehicle.status]}</strong>
        </div>
        <div>
          <small>位置</small>
          <strong>{vehicle.locationName}</strong>
        </div>
        <div>
          <small>里程</small>
          <strong>{vehicle.odometerKm.toLocaleString("zh-CN")} km</strong>
        </div>
        <div>
          <small>最近上报</small>
          <strong>{formatDateTime(latestSample?.timestamp ?? vehicle.lastSeen)}</strong>
        </div>
      </div>
    </section>
  );
}

function RouteMap({
  samples,
  events,
}: {
  samples: TelemetrySample[];
  events: VehicleEvent[];
}) {
  if (samples.length === 0) {
    return (
      <section className="panel route-panel">
        <div className="panel-title">
          <RouteIcon size={18} />
          <h2>轨迹上下文</h2>
        </div>
        <EmptyState title="暂无轨迹" text="该时间窗没有 GPS 点。" />
      </section>
    );
  }

  const latValues = samples.map((sample) => sample.lat);
  const lngValues = samples.map((sample) => sample.lng);
  const minLat = Math.min(...latValues);
  const maxLat = Math.max(...latValues);
  const minLng = Math.min(...lngValues);
  const maxLng = Math.max(...lngValues);
  const width = 640;
  const height = 280;
  const padding = 28;
  const xScale = (lng: number) =>
    padding + ((lng - minLng) / Math.max(maxLng - minLng, 0.001)) * (width - padding * 2);
  const yScale = (lat: number) =>
    height - padding - ((lat - minLat) / Math.max(maxLat - minLat, 0.001)) * (height - padding * 2);
  const route = samples.map((sample) => `${xScale(sample.lng)},${yScale(sample.lat)}`).join(" ");
  const latest = samples[samples.length - 1];

  const eventMarkers = events.map((event) => {
    const nearest = samples.reduce((best, sample) => {
      const bestDistance = Math.abs(new Date(best.timestamp).getTime() - new Date(event.timestamp).getTime());
      const sampleDistance = Math.abs(new Date(sample.timestamp).getTime() - new Date(event.timestamp).getTime());
      return sampleDistance < bestDistance ? sample : best;
    }, samples[0]);

    return { event, sample: nearest };
  });

  return (
    <section className="panel route-panel">
      <div className="panel-title">
        <RouteIcon size={18} />
        <h2>轨迹上下文</h2>
      </div>
      <svg className="route-svg" viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <linearGradient id="routeGradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#1f9e89" />
            <stop offset="100%" stopColor="#2b5fd9" />
          </linearGradient>
        </defs>
        <rect className="map-surface" x="0" y="0" width={width} height={height} rx="8" />
        {[0.18, 0.36, 0.54, 0.72].map((ratio) => (
          <g key={ratio}>
            <line
              className="map-grid"
              x1={padding}
              x2={width - padding}
              y1={height * ratio}
              y2={height * ratio}
            />
            <line
              className="map-grid"
              x1={width * ratio}
              x2={width * ratio}
              y1={padding}
              y2={height - padding}
            />
          </g>
        ))}
        <polyline className="route-line" points={route} />
        {samples.map((sample, index) => (
          <circle
            className={sample.online ? "route-point" : "route-point offline"}
            cx={xScale(sample.lng)}
            cy={yScale(sample.lat)}
            key={sample.timestamp}
            r={index === samples.length - 1 ? 5 : 3}
          />
        ))}
        {eventMarkers.map(({ event, sample }) => (
          <g key={event.id}>
            <circle
              className={`event-marker ${event.severity}`}
              cx={xScale(sample.lng)}
              cy={yScale(sample.lat)}
              r="8"
            />
            <title>{`${formatTime(event.timestamp)} ${event.title}`}</title>
          </g>
        ))}
      </svg>
      <div className="route-meta">
        <span><MapPin size={14} /> 最新点 {formatTime(latest.timestamp)}</span>
        <span>{latest.lat.toFixed(4)}, {latest.lng.toFixed(4)}</span>
      </div>
    </section>
  );
}

function MetricChart({
  title,
  unit,
  samples,
  getValue,
  color,
}: {
  title: string;
  unit: string;
  samples: TelemetrySample[];
  getValue: (sample: TelemetrySample) => number;
  color: string;
}) {
  if (samples.length < 2) {
    return (
      <section className="metric-card">
        <h3>{title}</h3>
        <EmptyState title="数据不足" text="至少需要两个采样点。" compact />
      </section>
    );
  }

  const width = 300;
  const height = 120;
  const values = samples.map(getValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const yRange = Math.max(max - min, 1);
  const path = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * (width - 22) + 11;
      const y = height - 18 - ((value - min) / yRange) * (height - 34);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const current = values[values.length - 1];

  return (
    <section className="metric-card">
      <div className="metric-head">
        <h3>{title}</h3>
        <strong>{current.toFixed(1)}{unit}</strong>
      </div>
      <svg className="metric-svg" viewBox={`0 0 ${width} ${height}`} role="img">
        <line className="chart-grid" x1="10" x2={width - 10} y1="24" y2="24" />
        <line className="chart-grid" x1="10" x2={width - 10} y1="66" y2="66" />
        <line className="chart-grid" x1="10" x2={width - 10} y1="108" y2="108" />
        <path d={path} fill="none" stroke={color} strokeLinecap="round" strokeWidth="3" />
        <circle cx={width - 11} cy={height - 18 - ((current - min) / yRange) * (height - 34)} fill={color} r="4" />
      </svg>
      <div className="metric-range">
        <span>{min.toFixed(1)}{unit}</span>
        <span>{max.toFixed(1)}{unit}</span>
      </div>
    </section>
  );
}

function MetricsPanel({ samples }: { samples: TelemetrySample[] }) {
  return (
    <section className="panel metrics-panel">
      <div className="panel-title">
        <Activity size={18} />
        <h2>同步遥测</h2>
      </div>
      <div className="metric-grid">
        <MetricChart
          color="#2b5fd9"
          getValue={(sample) => sample.speedKph}
          samples={samples}
          title="车速"
          unit="km/h"
        />
        <MetricChart
          color="#1f9e89"
          getValue={(sample) => sample.soc}
          samples={samples}
          title="SOC"
          unit="%"
        />
        <MetricChart
          color="#d97706"
          getValue={(sample) => sample.batteryTempC}
          samples={samples}
          title="电池温度"
          unit="C"
        />
        <MetricChart
          color="#a855f7"
          getValue={(sample) => sample.bmsScore}
          samples={samples}
          title="BMS评分"
          unit=""
        />
      </div>
    </section>
  );
}

function ComparisonPanel({ comparison }: { comparison: WindowComparison }) {
  const items = [
    { label: "SOC变化", value: formatDelta(comparison.socDelta, "%") },
    { label: "温度变化", value: formatDelta(comparison.tempDelta, "C") },
    { label: "里程变化", value: formatDelta(comparison.mileageDelta, "km") },
    { label: "BMS评分", value: formatDelta(comparison.bmsScoreDelta, "") },
  ];

  return (
    <section className="panel compact-panel">
      <div className="panel-title">
        <BatteryCharging size={18} />
        <h2>窗口对比</h2>
      </div>
      <div className="comparison-grid">
        {items.map((item) => (
          <div className="comparison-item" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimelinePanel({
  events,
  severity,
  onSeverityChange,
}: {
  events: VehicleEvent[];
  severity: "all" | EventSeverity;
  onSeverityChange: (severity: "all" | EventSeverity) => void;
}) {
  const filteredEvents = filterEventsBySeverity(events, severity);

  return (
    <section className="panel timeline-panel">
      <div className="panel-title timeline-title">
        <div>
          <Clock3 size={18} />
          <h2>事件时间线</h2>
        </div>
        <select
          value={severity}
          onChange={(event) => onSeverityChange(event.target.value as "all" | EventSeverity)}
        >
          <option value="all">全部</option>
          <option value="critical">严重</option>
          <option value="warning">预警</option>
          <option value="info">记录</option>
        </select>
      </div>
      {filteredEvents.length === 0 ? (
        <EmptyState title="暂无事件" text="当前时间窗没有匹配事件。" />
      ) : (
        <div className="timeline-list">
          {filteredEvents.map((event) => (
            <article className={`timeline-event ${event.severity}`} key={event.id}>
              <time>{formatTime(event.timestamp)}</time>
              <div>
                <span className={`risk-pill ${getRiskClass(event.severity)}`}>
                  {severityLabels[event.severity]}
                </span>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function InsightCard({ insight, isPrimary }: { insight: DiagnosticInsight; isPrimary: boolean }) {
  return (
    <article className={`insight-card ${getRiskClass(insight.severity)} ${isPrimary ? "primary" : ""}`}>
      <div className="insight-head">
        <span className={`risk-pill ${getRiskClass(insight.severity)}`}>
          {riskLabels[insight.severity]}
        </span>
        <h3>{insight.title}</h3>
      </div>
      <p>{insight.summary}</p>
      <div className="insight-block">
        <span>可能原因</span>
        <strong>{insight.likelyCause}</strong>
      </div>
      <div className="tag-row">
        {insight.affectedSignals.map((signal) => (
          <span key={signal}>{signal}</span>
        ))}
      </div>
      <div className="evidence-grid">
        <div>
          <span>证据</span>
          <ul>
            {insight.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <span>下一步</span>
          <ul>
            {insight.nextChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function DiagnosticsPanel({ insights }: { insights: DiagnosticInsight[] }) {
  return (
    <section className="panel diagnostics-panel">
      <div className="panel-title">
        <Brain size={18} />
        <h2>AI辅助研判</h2>
      </div>
      <div className="diagnostics-list">
        {insights.map((insight, index) => (
          <InsightCard insight={insight} isPrimary={index === 0} key={insight.id} />
        ))}
      </div>
    </section>
  );
}

function EmptyState({
  title,
  text,
  compact = false,
}: {
  title: string;
  text: string;
  compact?: boolean;
}) {
  return (
    <div className={`empty-state ${compact ? "compact" : ""}`}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

export default function App() {
  const [filters, setFilters] = useState<VehicleFilters>({
    search: "",
    status: "all",
    riskLevel: "all",
    group: "all",
  });
  const [selectedWindowId, setSelectedWindowId] = useState("incident");
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0].id);
  const [eventSeverity, setEventSeverity] = useState<"all" | EventSeverity>("all");

  const activeWindow = timeWindows.find((window) => window.id === selectedWindowId) ?? timeWindows[0];
  const groups = useMemo(() => getGroups(vehicles), []);
  const visibleVehicles = useMemo(() => filterVehicles(vehicles, filters), [filters]);

  useEffect(() => {
    if (visibleVehicles.length === 0) {
      setSelectedVehicleId("");
      return;
    }

    if (!visibleVehicles.some((vehicle) => vehicle.id === selectedVehicleId)) {
      setSelectedVehicleId(visibleVehicles[0].id);
    }
  }, [selectedVehicleId, visibleVehicles]);

  const selectedVehicle = visibleVehicles.find((vehicle) => vehicle.id === selectedVehicleId);
  const selectedSamples = selectedVehicle
    ? getSamplesForWindow(telemetrySamples, selectedVehicle.id, activeWindow)
    : [];
  const selectedEvents = selectedVehicle
    ? getEventsForWindow(vehicleEvents, selectedVehicle.id, activeWindow)
    : [];
  const latestSample = getLatestSample(selectedSamples);
  const fleetSummary = calculateFleetSummary(visibleVehicles, telemetrySamples, vehicleEvents, activeWindow);
  const comparison = getWindowComparison(selectedSamples);
  const diagnostics = selectedVehicle ? buildDiagnostics(selectedVehicle, selectedSamples, selectedEvents) : [];

  return (
    <main className="app-shell">
      <FleetHeader summary={fleetSummary} window={activeWindow} />
      <div className="dashboard-grid">
        <aside className="left-rail">
          <FilterPanel filters={filters} groups={groups} onChange={setFilters} />
          <VehicleList
            onSelect={setSelectedVehicleId}
            selectedVehicleId={selectedVehicleId}
            vehicles={visibleVehicles}
          />
        </aside>
        <section className="workbench">
          <TimeWindowControl
            activeWindowId={selectedWindowId}
            onChange={setSelectedWindowId}
            windows={timeWindows}
          />
          <div className="top-grid">
            <VehicleContext latestSample={latestSample} vehicle={selectedVehicle} />
            <ComparisonPanel comparison={comparison} />
          </div>
          <div className="analysis-grid">
            <div className="analysis-main">
              <RouteMap events={selectedEvents} samples={selectedSamples} />
              <MetricsPanel samples={selectedSamples} />
            </div>
            <div className="analysis-side">
              <DiagnosticsPanel insights={diagnostics} />
              <TimelinePanel
                events={selectedEvents}
                onSeverityChange={setEventSeverity}
                severity={eventSeverity}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
