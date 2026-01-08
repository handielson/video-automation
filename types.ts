
export enum VideoTone {
  IMPACTFUL = 'impactful',
  EDUCATIONAL = 'educational',
  EMOTIONAL = 'emotional',
  HUMOROUS = 'humorous'
}

export enum VideoDuration {
  S30 = 30,
  S45 = 45,
  S60 = 60
}

export interface ScriptOutput {
  title: string;
  hook: string;
  body: string;
  cta: string;
  suggestedVisuals: string;
}

export interface VideoProject {
  id: string;
  theme: string;
  tone: VideoTone;
  duration: VideoDuration;
  script?: ScriptOutput;
  audioUrl?: string;
  videoUrl?: string;
  status: 'idle' | 'generating_script' | 'generating_audio' | 'generating_video' | 'ready' | 'error';
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'M' | 'F';
}
