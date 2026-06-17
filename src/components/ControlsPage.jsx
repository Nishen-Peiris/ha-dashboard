import { useEffect, useRef, useState } from 'react'
import { BatteryCharging, Bot, Coffee, Droplets, Fan, LampFloor, Lightbulb, Monitor, Plug, Wind, X } from 'lucide-react'
import ClimateCard from './ClimateCard'
import DeviceCard from './DeviceCard'
import MediaCard from './MediaCard'
import airConditionerImage from '../assets/device-air-conditioner.png'
import airPurifierImage from '../assets/device-air-purifier.png'
import appleTvImage from '../assets/apple-tv.png'
import chargerImage from '../assets/device-charger.png'
import coffeeMakerImage from '../assets/device-coffee-maker.png'
import fanImage from '../assets/device-fan.png'
import kettleImage from '../assets/device-kettle.png'
import lightStripImage from '../assets/device-light-strip.png'
import monitorImage from '../assets/device-monitor.png'
import pendantLightImage from '../assets/device-pendant-light.png'
import sonyBraviaImage from '../assets/sony-bravia.png'
import vaporizerImage from '../assets/device-vaporizer.png'
import vacuumImage from '../assets/device-xiaomi-h40-vacuum.png'
import washingMachineImage from '../assets/device-washing-machine.png'

export const ROOMS = [
  'Outdoor',
  'Living Room',
  'Front Room',
  'Bedroom',
  'Kitchen',
  'Back Room',
  'Bathroom',
]

function getVolumePercent(entity) {
  const volumeLevel = entity?.attributes?.volume_level
  return typeof volumeLevel === 'number' ? Math.round(volumeLevel * 100) : 0
}

function isMediaOn(entity) {
  if (!entity) return false
  return !['off', 'standby', 'unavailable', 'unknown'].includes(entity.state)
}

function getBrightnessPercent(entity) {
  const brightness = entity?.attributes?.brightness
  return typeof brightness === 'number' ? Math.round((brightness / 255) * 100) : 0
}

function getNumericEntityValue(entity, fallback = 0) {
  const parsed = Number.parseFloat(entity?.state)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatStatusLabel(entity) {
  const value = entity?.state

  if (!value || ['unknown', 'unavailable'].includes(value)) {
    return undefined
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function hasActiveStatus(entity, inactiveStates = ['idle', 'off', 'unknown', 'unavailable']) {
  const state = entity?.state?.toLowerCase()
  return Boolean(state) && !inactiveStates.includes(state)
}

function formatClimateSubtitle(isOn, temperature, filterRemaining) {
  if (!isOn) {
    return undefined
  }

  const parts = []

  if (Number.isFinite(temperature)) {
    parts.push(`${Math.round(temperature)}°C`)
  }

  if (Number.isFinite(filterRemaining)) {
    parts.push(`Filter ${Math.max(0, Math.min(100, Math.round(filterRemaining)))}%`)
  }

  return parts.join(' • ') || undefined
}

export default function ControlsPage({ selectedRoom, entityIndex, onCallService }) {
  const [openSelector, setOpenSelector] = useState(null)
  const [brightnessModal, setBrightnessModal] = useState(null)
  const [draftBrightness, setDraftBrightness] = useState(0)
  const brightnessDialogRef = useRef(null)
  const appleTv = entityIndex['media_player.apple_tv']
  const cornerLight = entityIndex['light.corner_light']
  const bedroomAirPurifier = entityIndex['fan.xiaomi_cpa4_680c_air_purifier']
  const bedroomAirConditioner = entityIndex['input_boolean.bedroom_ac_power']
  const bedroomAcFilterRemaining = entityIndex['sensor.ac_filter_remaining']
  const bedroomAirConditionerTemperature = entityIndex['input_number.bedroom_ac_temperature']
  const bedroomFan = entityIndex['fan.bedroom_fan']
  const bedroomSonyTv = entityIndex['media_player.bedroom_sony_tv']
  const bedroomVaporizer = entityIndex['switch.bedroom_vaporizer']
  const bedroomTableLamp = entityIndex['switch.table_lamp']
  const kettle = entityIndex['switch.kettle']
  const coffeeMaker = entityIndex['switch.coffee_maker']
  const deviceToCharge = entityIndex['input_select.device_to_charge']
  const frontRoomAcPower = entityIndex['input_boolean.front_room_ac_power']
  const frontRoomAcTemperature = entityIndex['input_number.front_room_ac_temperature']
  const frontRoomFan = entityIndex['fan.front_room_fan']
  const frontRoomLight = entityIndex['light.front_room_light']
  const frontRoomLightBrightness = entityIndex['input_number.front_room_light_brightness']
  const frontRoomMonitor = entityIndex['switch.himashi_s_monitor']
  const frontRoomStreamingLights = entityIndex['switch.streaming_lights']
  const lightStrip = entityIndex['light.light_strip']
  const livingRoomChargerOutlet = entityIndex['switch.living_room_charger_outlet']
  const livingRoomFan = entityIndex['fan.living_room_fan']
  const livingRoomMonitor = entityIndex['switch.nishen_s_monitor']
  const livingRoomVacuumStatus = entityIndex['sensor.xiaomi_ov51gl_cfcf_status']
  const bathroomWashingMachineStatus = entityIndex['sensor.washing_machine_status']
  const outdoorLight = entityIndex['light.outdoor_light']
  const backRoomLight = entityIndex['light.back_room_light']
  const bathroomLight = entityIndex['light.bathroom_light']
  const kitchenLight = entityIndex['light.kitchen_light']
  const livingRoomSonyTv = entityIndex['media_player.living_room_sony_tv']
  const isBedroomAirPurifierOn = bedroomAirPurifier?.state === 'on'
  const isBedroomAirConditionerOn = bedroomAirConditioner?.state === 'on'
  const isBedroomFanOn = bedroomFan?.state === 'on'
  const isBedroomVaporizerOn = bedroomVaporizer?.state === 'on'
  const isBedroomTableLampOn = bedroomTableLamp?.state === 'on'
  const isOn = kettle?.state === 'on'
  const isBackRoomLightOn = backRoomLight?.state === 'on'
  const isBathroomLightOn = bathroomLight?.state === 'on'
  const isCoffeeMakerOn = coffeeMaker?.state === 'on'
  const isKitchenLightOn = kitchenLight?.state === 'on'
  const isCornerLightOn = cornerLight?.state === 'on'
  const isFrontRoomAcOn = frontRoomAcPower?.state === 'on'
  const isFrontRoomFanOn = frontRoomFan?.state === 'on'
  const isFrontRoomLightOn = frontRoomLight?.state === 'on'
  const isFrontRoomMonitorOn = frontRoomMonitor?.state === 'on'
  const isFrontRoomStreamingLightsOn = frontRoomStreamingLights?.state === 'on'
  const isLightStripOn = lightStrip?.state === 'on'
  const isLivingRoomChargerOn = livingRoomChargerOutlet?.state === 'on'
  const isLivingRoomFanOn = livingRoomFan?.state === 'on'
  const isLivingRoomMonitorOn = livingRoomMonitor?.state === 'on'
  const isOutdoorLightOn = outdoorLight?.state === 'on'
  const backRoomLightBrightness = backRoomLight?.attributes?.brightness
    ? Math.round((backRoomLight.attributes.brightness / 255) * 100)
    : 0
  const bathroomLightBrightness = bathroomLight?.attributes?.brightness
    ? Math.round((bathroomLight.attributes.brightness / 255) * 100)
    : 0
  const kitchenLightBrightness = kitchenLight?.attributes?.brightness
    ? Math.round((kitchenLight.attributes.brightness / 255) * 100)
    : 0
  const lightStripBrightness = getBrightnessPercent(lightStrip)
  const outdoorLightBrightness = getBrightnessPercent(outdoorLight)
  const frontRoomLightLevel = getNumericEntityValue(frontRoomLightBrightness)
  const frontRoomAcLevel = getNumericEntityValue(frontRoomAcTemperature, 24)
  const frontRoomAcFilterRemaining = 100
  const bedroomAirConditionerTargetTemperature = bedroomAirConditionerTemperature?.state
    ? Number.parseFloat(bedroomAirConditionerTemperature.state)
    : 0
  const bedroomAirConditionerFilterRemaining = getNumericEntityValue(bedroomAcFilterRemaining, Number.NaN)
  const bedroomSonyTvVolume = getVolumePercent(bedroomSonyTv)
  const appleTvVolume = getVolumePercent(appleTv)
  const isBedroomSonyTvOn = isMediaOn(bedroomSonyTv)
  const isLivingRoomSonyTvOn = isMediaOn(livingRoomSonyTv)
  const isAppleTvOn = isMediaOn(appleTv)
  const chargerOptions = deviceToCharge?.attributes?.options ?? []
  const chargerSubtitle = isLivingRoomChargerOn
    ? (deviceToCharge?.state ?? 'Device To Charge')
    : undefined
  const vacuumSubtitle = formatStatusLabel(livingRoomVacuumStatus)
  const washingMachineSubtitle = formatStatusLabel(bathroomWashingMachineStatus)
  const handleLightBrightnessChange = (entityId, brightness) => {
    onCallService('light', 'turn_on', { brightness_pct: brightness }, { entity_id: [entityId] })
  }
  const commitModalBrightness = () => {
    if (!brightnessModal) {
      return
    }

    handleLightBrightnessChange(brightnessModal.entityId, draftBrightness)
  }
  const openBrightnessModal = (config) => {
    setBrightnessModal(config)
    setDraftBrightness(config.brightness)
  }

  useEffect(() => {
    if (!brightnessModal) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!brightnessDialogRef.current?.contains(event.target)) {
        setBrightnessModal(null)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setBrightnessModal(null)
        return
      }

      if (event.key === 'Enter') {
        commitModalBrightness()
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [brightnessModal, draftBrightness])

  return (
    <div className="rooms-shell">
      <section className="rooms-content">
        {selectedRoom === 'Living Room' ? (
          <div className="rooms-grid">
              <DeviceCard
                title="Corner Light"
                icon={LampFloor}
                imageSrc={pendantLightImage}
                imageClassName="device-image-pendant-light"
                isOn={isCornerLightOn}
                onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.corner_light'] })}
              />
              <DeviceCard
                title="Fan"
                icon={Fan}
                imageSrc={fanImage}
                imageClassName="device-image-fan"
                isOn={isLivingRoomFanOn}
                onToggle={() => onCallService('fan', 'toggle', undefined, { entity_id: ['fan.living_room_fan'] })}
              />
              <MediaCard
                title="Sony Bravia"
                imageSrc={sonyBraviaImage}
                imageClassName="device-image-sony-bravia"
                isOn={isLivingRoomSonyTvOn}
                onToggle={() =>
                  onCallService('media_player', isLivingRoomSonyTvOn ? 'turn_off' : 'turn_on', undefined, { entity_id: ['media_player.living_room_sony_tv'] })
                }
              />
              <MediaCard
                title="Apple TV"
                subtitle={isAppleTvOn ? `${appleTvVolume}%` : undefined}
                imageSrc={appleTvImage}
                imageClassName="device-image-apple-tv"
                isOn={isAppleTvOn}
                onToggle={() =>
                  onCallService('media_player', isAppleTvOn ? 'turn_off' : 'turn_on', undefined, { entity_id: ['media_player.apple_tv'] })
                }
              />
              <DeviceCard
                title="Nishen's Monitor"
                icon={Monitor}
                imageSrc={monitorImage}
                isOn={isLivingRoomMonitorOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.nishen_s_monitor'] })}
              />
              <DeviceCard
                title="Charger"
                subtitle={chargerSubtitle}
                subtitleMenuLabel={chargerSubtitle}
                subtitleMenuOpen={isLivingRoomChargerOn && openSelector === 'living-room-charger'}
                subtitleMenuOptions={chargerOptions}
                onSubtitleClick={
                  isLivingRoomChargerOn
                    ? () => setOpenSelector((current) => (current === 'living-room-charger' ? null : 'living-room-charger'))
                    : undefined
                }
                onSubtitleSelect={(option) => {
                  setOpenSelector(null)
                  onCallService(
                    'input_select',
                    'select_option',
                    { option },
                    { entity_id: ['input_select.device_to_charge'] },
                  )
                }}
                icon={BatteryCharging}
                imageSrc={chargerImage}
                imageClassName="device-image-charger"
                isOn={isLivingRoomChargerOn}
                onToggle={() => {
                  setOpenSelector(null)
                  onCallService('switch', 'toggle', undefined, { entity_id: ['switch.living_room_charger_outlet'] })
                }}
              />
              <DeviceCard
                title="Xiaomi Robot Vacuum"
                subtitle={vacuumSubtitle}
                icon={Bot}
                imageSrc={vacuumImage}
                imageClassName="device-image-vacuum"
                isOn={['cleaning', 'returning', 'docking'].includes(livingRoomVacuumStatus?.state)}
                showToggle={false}
              />
          </div>
        ) : selectedRoom === 'Front Room' ? (
          <div className="rooms-grid">
              <DeviceCard
                title="Light"
                subtitle={isFrontRoomLightOn ? `${Math.round(frontRoomLightLevel)}%` : undefined}
                onCardClick={() => openBrightnessModal({
                  title: 'Front Room Light',
                  entityId: 'light.front_room_light',
                  brightness: Math.max(1, Math.round(frontRoomLightLevel)),
                })}
                icon={Lightbulb}
                imageSrc={pendantLightImage}
                imageClassName="device-image-pendant-light"
                isOn={isFrontRoomLightOn}
                onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.front_room_light'] })}
              />
              <DeviceCard
                title="Light Strip"
                subtitle={isLightStripOn ? `${lightStripBrightness}%` : undefined}
                onCardClick={() => openBrightnessModal({
                  title: 'Light Strip',
                  entityId: 'light.light_strip',
                  brightness: Math.max(1, lightStripBrightness),
                })}
                icon={Lightbulb}
                imageSrc={lightStripImage}
                isOn={isLightStripOn}
                onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.light_strip'] })}
              />
              <DeviceCard
                title="Fan"
                icon={Fan}
                imageSrc={fanImage}
                isOn={isFrontRoomFanOn}
                onToggle={() => onCallService('fan', 'toggle', undefined, { entity_id: ['fan.front_room_fan'] })}
              />
              <ClimateCard
                title="Air Conditioner"
                subtitle={formatClimateSubtitle(isFrontRoomAcOn, frontRoomAcLevel, frontRoomAcFilterRemaining)}
                imageSrc={airConditionerImage}
                imageClassName="device-image-air-conditioner"
                isOn={isFrontRoomAcOn}
                onToggle={() => onCallService('input_boolean', 'toggle', undefined, { entity_id: ['input_boolean.front_room_ac_power'] })}
              />
              <DeviceCard
                title="Vaporizer"
                icon={Droplets}
                imageSrc={vaporizerImage}
                imageClassName="device-image-vaporizer"
                isOn={isFrontRoomStreamingLightsOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.streaming_lights'] })}
              />
              <DeviceCard
                title="Himashi's Monitor"
                icon={Monitor}
                imageSrc={monitorImage}
                imageClassName="device-image-monitor"
                isOn={isFrontRoomMonitorOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.himashi_s_monitor'] })}
              />
          </div>
        ) : selectedRoom === 'Outdoor' ? (
          <div className="rooms-grid">
            <DeviceCard
              title="Light"
              subtitle={isOutdoorLightOn ? `${outdoorLightBrightness}%` : undefined}
              onCardClick={() => openBrightnessModal({
                title: 'Outdoor Light',
                entityId: 'light.outdoor_light',
                brightness: Math.max(1, outdoorLightBrightness),
              })}
              icon={Lightbulb}
              imageSrc={pendantLightImage}
              imageClassName="device-image-pendant-light"
              isOn={isOutdoorLightOn}
              onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.outdoor_light'] })}
            />
          </div>
        ) : selectedRoom === 'Kitchen' ? (
          <div className="rooms-grid">
              <DeviceCard
                title="Light"
                subtitle={isKitchenLightOn ? `${kitchenLightBrightness}%` : undefined}
                onCardClick={() => openBrightnessModal({
                  title: 'Kitchen Light',
                  entityId: 'light.kitchen_light',
                  brightness: Math.max(1, kitchenLightBrightness),
                })}
                icon={Lightbulb}
                imageSrc={pendantLightImage}
                imageClassName="device-image-pendant-light"
                isOn={isKitchenLightOn}
                onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.kitchen_light'] })}
              />
              <DeviceCard
                title="Kettle"
                icon={Plug}
                imageSrc={kettleImage}
                isOn={isOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.kettle'] })}
              />
              <DeviceCard
                title="Coffee Maker"
                icon={Coffee}
                imageSrc={coffeeMakerImage}
                isOn={isCoffeeMakerOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.coffee_maker'] })}
              />
          </div>
        ) : selectedRoom === 'Bedroom' ? (
          <div className="rooms-grid">
              <DeviceCard
                title="Table Lamp"
                icon={Lightbulb}
                imageSrc={pendantLightImage}
                imageClassName="device-image-pendant-light"
                isOn={isBedroomTableLampOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.table_lamp'] })}
              />
              <DeviceCard
                title="Fan"
                icon={Fan}
                imageSrc={fanImage}
                imageClassName="device-image-fan"
                isOn={isBedroomFanOn}
                onToggle={() => onCallService('fan', 'toggle', undefined, { entity_id: ['fan.bedroom_fan'] })}
              />
              <ClimateCard
                title="Air Conditioner"
                subtitle={formatClimateSubtitle(
                  isBedroomAirConditionerOn,
                  bedroomAirConditionerTargetTemperature,
                  bedroomAirConditionerFilterRemaining,
                )}
                imageSrc={airConditionerImage}
                imageClassName="device-image-air-conditioner"
                isOn={isBedroomAirConditionerOn}
                onToggle={() => onCallService('input_boolean', 'toggle', undefined, { entity_id: ['input_boolean.bedroom_ac_power'] })}
              />
              <DeviceCard
                title="Air Purifier"
                icon={Wind}
                imageSrc={airPurifierImage}
                isOn={isBedroomAirPurifierOn}
                onToggle={() => onCallService('fan', 'toggle', undefined, { entity_id: ['fan.xiaomi_cpa4_680c_air_purifier'] })}
              />
              <DeviceCard
                title="Vaporizer"
                icon={Droplets}
                imageSrc={vaporizerImage}
                imageClassName="device-image-vaporizer"
                isOn={isBedroomVaporizerOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.bedroom_vaporizer'] })}
              />
              <MediaCard
                title="Sony Bravia"
                subtitle={isBedroomSonyTvOn ? `${bedroomSonyTvVolume}%` : undefined}
                imageSrc={sonyBraviaImage}
                imageClassName="device-image-sony-bravia"
                isOn={isBedroomSonyTvOn}
                onToggle={() =>
                  onCallService('media_player', isBedroomSonyTvOn ? 'turn_off' : 'turn_on', undefined, { entity_id: ['media_player.bedroom_sony_tv'] })
                }
              />
          </div>
        ) : selectedRoom === 'Back Room' ? (
          <div className="rooms-grid">
            <DeviceCard
              title="Light"
              subtitle={isBackRoomLightOn ? `${backRoomLightBrightness}%` : undefined}
              onCardClick={() => openBrightnessModal({
                title: 'Back Room Light',
                entityId: 'light.back_room_light',
                brightness: Math.max(1, backRoomLightBrightness),
              })}
              icon={Lightbulb}
              imageSrc={pendantLightImage}
              imageClassName="device-image-pendant-light"
              isOn={isBackRoomLightOn}
              onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.back_room_light'] })}
            />
          </div>
        ) : selectedRoom === 'Bathroom' ? (
          <div className="rooms-grid">
            <DeviceCard
              title="Light"
              subtitle={isBathroomLightOn ? `${bathroomLightBrightness}%` : undefined}
              onCardClick={() => openBrightnessModal({
                title: 'Bathroom Light',
                entityId: 'light.bathroom_light',
                brightness: Math.max(1, bathroomLightBrightness),
              })}
              icon={Lightbulb}
              imageSrc={pendantLightImage}
              imageClassName="device-image-pendant-light"
              isOn={isBathroomLightOn}
              onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.bathroom_light'] })}
            />
            <DeviceCard
              title="Washing Machine"
              subtitle={washingMachineSubtitle}
              imageSrc={washingMachineImage}
              imageClassName="device-image-washing-machine"
              isOn={hasActiveStatus(bathroomWashingMachineStatus)}
              showToggle={false}
            />
          </div>
        ) : (
          <div className="rooms-empty-panel">No devices yet</div>
        )}
      </section>

      {brightnessModal ? (
        <div className="header-popup-backdrop">
          <div className="header-popup controls-brightness-popup card" ref={brightnessDialogRef} role="dialog" aria-label={brightnessModal.title}>
            <div className="header-popup-head">
              <div className="home-section-title">{brightnessModal.title}</div>
              <button
                className="header-popup-close"
                onClick={() => setBrightnessModal(null)}
                title={`Close ${brightnessModal.title}`}
                aria-label={`Close ${brightnessModal.title}`}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <div className="controls-brightness-body">
              <input
                className="controls-brightness-slider"
                type="range"
                min="1"
                max="100"
                step="1"
                value={draftBrightness}
                onChange={(event) => setDraftBrightness(Number(event.target.value))}
                onMouseUp={commitModalBrightness}
                onTouchEnd={commitModalBrightness}
                onKeyUp={(event) => {
                  if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End' || event.key === 'PageUp' || event.key === 'PageDown') {
                    commitModalBrightness()
                  }
                }}
              />
              <div className="controls-brightness-value">{draftBrightness}%</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
