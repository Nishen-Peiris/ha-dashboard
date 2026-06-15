import { useState } from 'react'
import { BatteryCharging, Coffee, Droplets, Fan, LampFloor, Lightbulb, Monitor, Plug, Wind } from 'lucide-react'
import ClimateCard from './ClimateCard'
import DeviceCard from './DeviceCard'
import MediaCard from './MediaCard'
import airConditionerImage from '../assets/device-air-conditioner.png'
import airPurifierImage from '../assets/device-air-purifier.png'
import chargerImage from '../assets/device-charger.png'
import coffeeMakerImage from '../assets/device-coffee-maker.png'
import fanImage from '../assets/device-fan.png'
import kettleImage from '../assets/device-kettle.png'
import lightStripImage from '../assets/device-light-strip.png'
import monitorImage from '../assets/device-monitor.png'
import pendantLightImage from '../assets/device-pendant-light.png'
import vaporizerImage from '../assets/device-vaporizer.png'

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

function getNumericEntityBounds(entity, fallbackMin, fallbackMax, fallbackStep = 1) {
  const min = Number.parseFloat(entity?.attributes?.min)
  const max = Number.parseFloat(entity?.attributes?.max)
  const step = Number.parseFloat(entity?.attributes?.step)

  return {
    min: Number.isFinite(min) ? min : fallbackMin,
    max: Number.isFinite(max) ? max : fallbackMax,
    step: Number.isFinite(step) ? step : fallbackStep,
  }
}

export default function ControlsPage({ selectedRoom, entityIndex, onCallService }) {
  const [openSelector, setOpenSelector] = useState(null)
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
  const outdoorLightBrightness = getBrightnessPercent(outdoorLight)
  const frontRoomLightLevel = getNumericEntityValue(frontRoomLightBrightness)
  const frontRoomLightBounds = getNumericEntityBounds(frontRoomLightBrightness, 0, 100, 1)
  const frontRoomAcLevel = getNumericEntityValue(frontRoomAcTemperature, 24)
  const frontRoomAcBounds = getNumericEntityBounds(frontRoomAcTemperature, 16, 30, 1)
  const frontRoomAcFilterRemaining = 100
  const bedroomAirConditionerTargetTemperature = bedroomAirConditionerTemperature?.state
    ? Number.parseFloat(bedroomAirConditionerTemperature.state)
    : 0
  const bedroomAirConditionerMinTemperature = 26
  const bedroomAirConditionerMaxTemperature = 30
  const bedroomAirConditionerTemperatureStep = 1
  const bedroomAirConditionerFilterRemaining = getNumericEntityValue(bedroomAcFilterRemaining, Number.NaN)
  const bedroomSonyTvVolume = getVolumePercent(bedroomSonyTv)
  const livingRoomSonyTvVolume = getVolumePercent(livingRoomSonyTv)
  const appleTvVolume = getVolumePercent(appleTv)
  const isBedroomSonyTvOn = isMediaOn(bedroomSonyTv)
  const isLivingRoomSonyTvOn = isMediaOn(livingRoomSonyTv)
  const isAppleTvOn = isMediaOn(appleTv)
  const chargerOptions = deviceToCharge?.attributes?.options ?? []
  const chargerSubtitle = isLivingRoomChargerOn
    ? (deviceToCharge?.state ?? 'Device To Charge')
    : undefined

  return (
    <div className="rooms-shell">
      <section className="rooms-content">
        {selectedRoom === 'Living Room' ? (
          <div className="rooms-grid">
              <DeviceCard
                title="Corner Light"
                icon={LampFloor}
                imageSrc={pendantLightImage}
                isOn={isCornerLightOn}
                onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.corner_light'] })}
              />
              <DeviceCard
                title="Fan"
                icon={Fan}
                imageSrc={fanImage}
                isOn={isLivingRoomFanOn}
                onToggle={() => onCallService('fan', 'toggle', undefined, { entity_id: ['fan.living_room_fan'] })}
              />
              <DeviceCard
                title="Sony Bravia"
                icon={Monitor}
                imageSrc={monitorImage}
                isOn={isLivingRoomSonyTvOn}
                onToggle={() =>
                  onCallService('media_player', isLivingRoomSonyTvOn ? 'turn_off' : 'turn_on', undefined, { entity_id: ['media_player.living_room_sony_tv'] })
                }
              />
              <MediaCard
                title="Apple TV"
                subtitle={isAppleTvOn ? `${appleTvVolume}%` : undefined}
                wide
                imageSrc={monitorImage}
                isOn={isAppleTvOn}
                volume={appleTvVolume}
                onToggle={() =>
                  onCallService('media_player', isAppleTvOn ? 'turn_off' : 'turn_on', undefined, { entity_id: ['media_player.apple_tv'] })
                }
                onPlay={() => onCallService('media_player', 'media_play', undefined, { entity_id: ['media_player.apple_tv'] })}
                onPause={() => onCallService('media_player', 'media_pause', undefined, { entity_id: ['media_player.apple_tv'] })}
                onVolumeChange={(value) =>
                  onCallService('media_player', 'volume_set', { volume_level: value / 100 }, { entity_id: ['media_player.apple_tv'] })
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
                isOn={isLivingRoomChargerOn}
                onToggle={() => {
                  setOpenSelector(null)
                  onCallService('switch', 'toggle', undefined, { entity_id: ['switch.living_room_charger_outlet'] })
                }}
              />
          </div>
        ) : selectedRoom === 'Front Room' ? (
          <div className="rooms-grid">
              <DeviceCard
                title="Light"
                subtitle={isFrontRoomLightOn ? `${Math.round(frontRoomLightLevel)}%` : undefined}
                icon={Lightbulb}
                imageSrc={pendantLightImage}
                isOn={isFrontRoomLightOn}
                sliderMin={frontRoomLightBounds.min}
                sliderMax={frontRoomLightBounds.max}
                sliderStep={frontRoomLightBounds.step}
                sliderCurrent={isFrontRoomLightOn ? frontRoomLightLevel : undefined}
                onSliderChange={(value) =>
                  onCallService('input_number', 'set_value', { value }, { entity_id: ['input_number.front_room_light_brightness'] })
                }
                onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.front_room_light'] })}
              />
              <DeviceCard
                title="Light Strip"
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
                wide
                imageSrc={airConditionerImage}
                isOn={isFrontRoomAcOn}
                targetTemperature={frontRoomAcLevel}
                filterRemaining={frontRoomAcFilterRemaining}
                step={frontRoomAcBounds.step}
                onTemperatureChange={(value) =>
                  onCallService(
                    'input_number',
                    'set_value',
                    { value: Math.max(frontRoomAcBounds.min, Math.min(frontRoomAcBounds.max, value)) },
                    { entity_id: ['input_number.front_room_ac_temperature'] },
                  )
                }
                onToggle={() => onCallService('input_boolean', 'toggle', undefined, { entity_id: ['input_boolean.front_room_ac_power'] })}
              />
              <DeviceCard
                title="Vaporizer"
                icon={Droplets}
                imageSrc={vaporizerImage}
                isOn={isFrontRoomStreamingLightsOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.streaming_lights'] })}
              />
              <DeviceCard
                title="Himashi's Monitor"
                icon={Monitor}
                imageSrc={monitorImage}
                isOn={isFrontRoomMonitorOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.himashi_s_monitor'] })}
              />
          </div>
        ) : selectedRoom === 'Outdoor' ? (
          <div className="rooms-grid">
            <DeviceCard
              title="Light"
              subtitle={isOutdoorLightOn ? `${outdoorLightBrightness}%` : undefined}
              icon={Lightbulb}
              imageSrc={pendantLightImage}
              isOn={isOutdoorLightOn}
              sliderMin={0}
              sliderMax={100}
              sliderCurrent={outdoorLightBrightness}
              onSliderChange={(value) =>
                onCallService('light', 'turn_on', { brightness_pct: value }, { entity_id: ['light.outdoor_light'] })
              }
              onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.outdoor_light'] })}
            />
          </div>
        ) : selectedRoom === 'Kitchen' ? (
          <div className="rooms-grid">
              <DeviceCard
                title="Light"
                subtitle={isKitchenLightOn ? `${kitchenLightBrightness}%` : undefined}
                icon={Lightbulb}
                imageSrc={pendantLightImage}
                isOn={isKitchenLightOn}
                sliderMin={0}
                sliderMax={100}
                sliderCurrent={kitchenLightBrightness}
                onSliderChange={(value) =>
                  onCallService('light', 'turn_on', { brightness_pct: value }, { entity_id: ['light.kitchen_light'] })
                }
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
                isOn={isBedroomTableLampOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.table_lamp'] })}
              />
              <DeviceCard
                title="Fan"
                icon={Fan}
                imageSrc={fanImage}
                isOn={isBedroomFanOn}
                onToggle={() => onCallService('fan', 'toggle', undefined, { entity_id: ['fan.bedroom_fan'] })}
              />
              <ClimateCard
                title="Air Conditioner"
                wide
                imageSrc={airConditionerImage}
                isOn={isBedroomAirConditionerOn}
                targetTemperature={bedroomAirConditionerTargetTemperature}
                filterRemaining={bedroomAirConditionerFilterRemaining}
                step={bedroomAirConditionerTemperatureStep}
                onTemperatureChange={(value) =>
                  onCallService(
                    'input_number',
                    'set_value',
                    { value: Math.max(bedroomAirConditionerMinTemperature, Math.min(bedroomAirConditionerMaxTemperature, value)) },
                    { entity_id: ['input_number.bedroom_ac_temperature'] },
                  )
                }
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
                isOn={isBedroomVaporizerOn}
                onToggle={() => onCallService('switch', 'toggle', undefined, { entity_id: ['switch.bedroom_vaporizer'] })}
              />
              <MediaCard
                title="Sony Bravia"
                subtitle={isBedroomSonyTvOn ? `${bedroomSonyTvVolume}%` : undefined}
                wide
                imageSrc={monitorImage}
                isOn={isBedroomSonyTvOn}
                volume={bedroomSonyTvVolume}
                onToggle={() =>
                  onCallService('media_player', isBedroomSonyTvOn ? 'turn_off' : 'turn_on', undefined, { entity_id: ['media_player.bedroom_sony_tv'] })
                }
                onPlay={() => onCallService('media_player', 'media_play', undefined, { entity_id: ['media_player.bedroom_sony_tv'] })}
                onPause={() => onCallService('media_player', 'media_pause', undefined, { entity_id: ['media_player.bedroom_sony_tv'] })}
                onVolumeChange={(value) =>
                  onCallService('media_player', 'volume_set', { volume_level: value / 100 }, { entity_id: ['media_player.bedroom_sony_tv'] })
                }
              />
          </div>
        ) : selectedRoom === 'Back Room' ? (
          <div className="rooms-grid">
            <DeviceCard
              title="Light"
              subtitle={isBackRoomLightOn ? `${backRoomLightBrightness}%` : undefined}
              icon={Lightbulb}
              imageSrc={pendantLightImage}
              isOn={isBackRoomLightOn}
              sliderMin={0}
              sliderMax={100}
              sliderCurrent={backRoomLightBrightness}
              onSliderChange={(value) =>
                onCallService('light', 'turn_on', { brightness_pct: value }, { entity_id: ['light.back_room_light'] })
              }
              onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.back_room_light'] })}
            />
          </div>
        ) : selectedRoom === 'Bathroom' ? (
          <div className="rooms-grid">
            <DeviceCard
              title="Light"
              subtitle={isBathroomLightOn ? `${bathroomLightBrightness}%` : undefined}
              icon={Lightbulb}
              imageSrc={pendantLightImage}
              isOn={isBathroomLightOn}
              sliderMin={0}
              sliderMax={100}
              sliderCurrent={bathroomLightBrightness}
              onSliderChange={(value) =>
                onCallService('light', 'turn_on', { brightness_pct: value }, { entity_id: ['light.bathroom_light'] })
              }
              onToggle={() => onCallService('light', 'toggle', undefined, { entity_id: ['light.bathroom_light'] })}
            />
          </div>
        ) : (
          <div className="rooms-empty-panel">No devices yet</div>
        )}
      </section>
    </div>
  )
}
