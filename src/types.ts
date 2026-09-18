export type VisualizationMode =
  | 'REALISTIC'
  | 'WIREFRAME'
  | 'XRAY'
  | 'INFRARED'
  | 'THERMAL'
  | 'ANALYTICAL';

export type SpatialView =
  | 'EARTH'
  | 'ORBIT'
  | 'MISSION'
  | 'SPACECRAFT'
  | 'COMPONENT';

export type SubsystemType =
  | 'OPTICS'
  | 'POWER'
  | 'THERMAL'
  | 'PROPULSION'
  | 'AVIONICS'
  | 'PAYLOAD'
  | 'STRUCTURE';

export interface SpacecraftComponent {
  id: string;
  name: string;
  subsystem: SubsystemType;
  function: string;
  material: string;
  scientificRole: string;
  status: 'NOMINAL' | 'ACTIVE' | 'STANDBY' | 'CALIBRATING';
  temperatureC: number;
  explodeOffset: [number, number, number]; // Vector direction when exploded
  analyticalColor: string;
}

export interface MissionEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  phase: 'LAUNCH' | 'DEPLOYMENT' | 'TRAJECTORY' | 'ORBIT' | 'COMMISSIONING' | 'PRIMARY' | 'CURRENT';
  telemetrySnapshot?: {
    distanceKm: string;
    speedKmh: string;
    status: string;
  };
}

export interface TelemetryData {
  altitudeKm: number;
  velocityKmS: number;
  orbitType: string;
  temperatureC: number;
  sunshieldTempC?: number;
  powerLevelPercent: number;
  commStatus: 'NOMINAL' | 'HIGH-GAIN ACTIVE' | 'TRANSMITTING' | 'OCCULTATION';
  signalQualityPercent: number;
  sunExposurePercent: number;
  angularRateDegS: number;
  downlinkDataRateMbps: number;
  radiationRadHr: number;
  isSimulated: boolean;
  historicalTrend: {
    time: string;
    velocity: number;
    altitude: number;
    temperature: number;
    power: number;
  }[];
}

export interface NasaAsset {
  id: string;
  name: string;
  codeName: string;
  mission: string;
  destination: string;
  operationalStatus: 'ACTIVE MISSION' | 'EXTENDED MISSION' | 'COMPLETED' | 'PERMANENT LAB';
  launchDate: string;
  scientificPurpose: string;
  category: 'DEEP_SPACE' | 'MARS_EXPLORATION' | 'LEO_ORBIT' | 'LUNAR_HISTORIC' | 'PLANETARY';
  modelScale: number;
  defaultCameraDistance: number;
  components: SpacecraftComponent[];
  timeline: MissionEvent[];
  initialTelemetry: TelemetryData;
  massKg: string;
  dimensions: string;
  orbitDetails: {
    periapsis: string;
    apoapsis: string;
    period: string;
    inclination: string;
  };
  keyScienceGoals: string[];
}

export interface ApodData {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  copyright?: string;
  live?: boolean;
  notice?: string;
}

export interface LearningStep {
  stepNumber: number;
  title: string;
  instruction: string;
  targetComponentId?: string;
  recommendedMode?: VisualizationMode;
  explanation: string;
}

export interface LearningQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningMission {
  id: string;
  spacecraftId: string;
  title: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  overview: string;
  steps: LearningStep[];
  quiz: LearningQuizQuestion[];
}
