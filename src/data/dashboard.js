import { Activity, Bot, Cpu, Leaf, Snowflake, Wind } from 'lucide-react'
import airConditionerImage from '../assets/device-air-conditioner.png'
import airPurifierImage from '../assets/device-air-purifier.png'
import vacuumImage from '../assets/device-xiaomi-h40-vacuum.png'

const runtimeConfig = window.HA_DASHBOARD_CONFIG ?? {}

export const defaultSettings = {
  baseUrl: runtimeConfig.baseUrl ?? '',
  fallbackUrls: runtimeConfig.fallbackUrls ?? [],
  token: runtimeConfig.token ?? '',
  mappings: {
    systemCpu: 'sensor.home_assistant_core_cpu_percent',
    systemMemory: 'sensor.home_assistant_core_memory_percent',
    networkDownload: 'sensor.router_download_speed_mb_s',
    networkUpload: 'sensor.router_upload_speed_mb_s',
    pm25Density: 'sensor.xiaomi_cpa4_680c_pm25_density',
    vacuumStatus: 'sensor.xiaomi_ov51gl_cfcf_status',
    airPurifierStatus: 'fan.xiaomi_cpa4_680c_air_purifier',
    airConditionerStatus: 'input_boolean.bedroom_ac_power',
    airPurifierFilter: 'sensor.air_purifier_filter_remaining',
    airConditionerFilter: 'sensor.ac_filter_remaining',
    vacuumDustBag: 'sensor.xiaomi_ov51gl_cfcf_dust_bag_life_level',
  },
}

export const doorEntities = [
  'binary_sensor.bedroom_door',
  'binary_sensor.kitchen_door',
  'binary_sensor.main_door',
  'binary_sensor.contact_sensor',
]

export const doorLabels = {
  'binary_sensor.bedroom_door': 'Bedroom Door',
  'binary_sensor.kitchen_door': 'Kitchen Door',
  'binary_sensor.main_door': 'Main Door',
  'binary_sensor.contact_sensor': 'Bathroom Door',
}

export const metricDefinitions = [
  {
    title: 'Home Assistant',
    kind: 'history',
    stats: [
      { label: 'CPU', color: '#2563eb', dataKey: 'cpu' },
      { label: 'Memory', color: '#7c3aed', dataKey: 'memory' },
    ],
    historyKey: 'system',
    icon: Cpu,
    tone: '#2563eb',
  },
  {
    title: 'Network',
    kind: 'history',
    stats: [
      { label: 'Download', color: '#0ea5e9', dataKey: 'download' },
      { label: 'Upload', color: '#14b8a6', dataKey: 'upload' },
    ],
    historyKey: 'network',
    icon: Activity,
    tone: '#0f766e',
  },
  {
    title: 'Air Quality',
    kind: 'history',
    stats: [
      { label: 'PM2.5', color: '#0f766e', dataKey: 'pm25' },
    ],
    historyKey: 'pm25',
    icon: Leaf,
    tone: '#0f766e',
  },
  {
    title: 'Comfri Air Conditioner',
    kind: 'status',
    stats: [
      { label: 'Air Conditioner Filter', color: '#d97706' },
    ],
    icon: Snowflake,
    imageSrc: airConditionerImage,
    tone: '#b45309',
  },
  {
    title: 'Xiaomi Robot Vacuum',
    kind: 'status',
    stats: [
      { label: 'Vacuum Dust Bag', color: '#dc2626' },
    ],
    icon: Bot,
    imageSrc: vacuumImage,
    tone: '#475569',
  },
  {
    title: 'Xiaomi Air Purifier',
    kind: 'status',
    stats: [
      { label: 'Air Purifier Filter', color: '#0f766e' },
    ],
    icon: Wind,
    imageSrc: airPurifierImage,
    tone: '#0f766e',
  },
]

export const emptyMetricHistory = {
  system: [],
  network: [],
  pm25: [],
}
