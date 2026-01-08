
import React from 'react';
import { VideoTone, VoiceOption } from './types';

export const TONE_OPTIONS = [
  { value: VideoTone.IMPACTFUL, label: 'Impactante (Mindset)', icon: '🔥' },
  { value: VideoTone.EDUCATIONAL, label: 'Educativo (Curiosidades)', icon: '🧠' },
  { value: VideoTone.EMOTIONAL, label: 'Emocional (Storytelling)', icon: '❤️' },
  { value: VideoTone.HUMOROUS, label: 'Humor (Viral)', icon: '😂' },
];

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'Kore', name: 'Ricardo (Masculino)', gender: 'M' },
  { id: 'Puck', name: 'Juliana (Feminino)', gender: 'F' },
  { id: 'Charon', name: 'Marcos (Grave)', gender: 'M' },
  { id: 'Fenrir', name: 'Sofia (Suave)', gender: 'F' },
];
