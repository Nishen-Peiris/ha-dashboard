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

export const defaultMetrics = [
  {
    title: 'Home Assistant',
    kind: 'history',
    stats: [
      { label: 'CPU', value: 28, color: '#2563eb', dataKey: 'cpu' },
      { label: 'Memory', value: 61, color: '#7c3aed', dataKey: 'memory' },
    ],
    historyKey: 'system',
    icon: Cpu,
    tone: '#2563eb',
  },
  {
    title: 'Network',
    kind: 'history',
    stats: [
      { label: 'Download', value: 86, color: '#0ea5e9', displayLabel: '86 MB/s', dataKey: 'download' },
      { label: 'Upload', value: 42, color: '#14b8a6', displayLabel: '42 MB/s', dataKey: 'upload' },
    ],
    historyKey: 'network',
    icon: Activity,
    tone: '#0f766e',
  },
  {
    title: 'Air Quality',
    kind: 'history',
    stats: [
      { label: 'PM2.5', value: 14, color: '#0f766e', displayLabel: '14 μg/m³', dataKey: 'pm25' },
    ],
    historyKey: 'pm25',
    icon: Leaf,
    tone: '#0f766e',
  },
  {
    title: 'Comfri Air Conditioner',
    kind: 'status',
    status: {
      value: 'Off',
      tone: 'idle',
    },
    stats: [
      { label: 'Air Conditioner Filter', value: 18, color: '#d97706' },
    ],
    icon: Snowflake,
    imageSrc: airConditionerImage,
    tone: '#b45309',
  },
  {
    title: 'Xiaomi Robot Vacuum',
    kind: 'status',
    status: {
      value: 'Idle',
      tone: 'idle',
    },
    stats: [
      { label: 'Vacuum Dust Bag', value: 18, color: '#dc2626' },
    ],
    icon: Bot,
    imageSrc: vacuumImage,
    tone: '#475569',
  },
  {
    title: 'Xiaomi Air Purifier',
    kind: 'status',
    status: {
      value: 'Off',
      tone: 'idle',
    },
    stats: [
      { label: 'Air Purifier Filter', value: 74, color: '#0f766e' },
    ],
    icon: Wind,
    imageSrc: airPurifierImage,
    tone: '#0f766e',
  },
]

export const defaultMetricHistory = {
  system: [
    { index: 0, cpu: 24, memory: 52 },
    { index: 1, cpu: 31, memory: 56 },
    { index: 2, cpu: 27, memory: 59 },
    { index: 3, cpu: 36, memory: 63 },
    { index: 4, cpu: 29, memory: 61 },
    { index: 5, cpu: 28, memory: 61 },
  ],
  network: [
    { index: 0, download: 72, upload: 35 },
    { index: 1, download: 80, upload: 38 },
    { index: 2, download: 76, upload: 33 },
    { index: 3, download: 91, upload: 47 },
    { index: 4, download: 88, upload: 44 },
    { index: 5, download: 86, upload: 42 },
  ],
  pm25: [
    { index: 0, pm25: 11 },
    { index: 1, pm25: 13 },
    { index: 2, pm25: 15 },
    { index: 3, pm25: 12 },
    { index: 4, pm25: 16 },
    { index: 5, pm25: 14 },
  ],
}
