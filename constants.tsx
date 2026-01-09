
import React from 'react';
import { VideoTone, VoiceOption } from './types';

export const TONE_OPTIONS = [
  { value: VideoTone.IMPACTFUL, label: 'Impactante (Mindset)', icon: '🔥' },
  { value: VideoTone.EDUCATIONAL, label: 'Educativo (Curiosidades)', icon: '🧠' },
  { value: VideoTone.EMOTIONAL, label: 'Emocional (Storytelling)', icon: '❤️' },
  { value: VideoTone.HUMOROUS, label: 'Humor (Viral)', icon: '😂' },
];

// Gemini TTS Voices
export const GEMINI_VOICE_OPTIONS: VoiceOption[] = [
  { id: 'random', name: '🎲 Aleatório', gender: 'M' },
  { id: 'Kore', name: 'Ricardo (Masculino)', gender: 'M' },
  { id: 'Puck', name: 'Juliana (Feminino)', gender: 'F' },
  { id: 'Charon', name: 'Marcos (Grave)', gender: 'M' },
  { id: 'Fenrir', name: 'Sofia (Suave)', gender: 'F' },
];

// ElevenLabs Voices (Brazilian Portuguese)
export const ELEVENLABS_VOICE_OPTIONS: VoiceOption[] = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Narrativo)', gender: 'M' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Energética)', gender: 'F' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Profissional)', gender: 'M' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (Jovem)', gender: 'F' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (Dinâmico)', gender: 'M' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (Grave)', gender: 'M' },
];

// Legacy export for backward compatibility
export const VOICE_OPTIONS = GEMINI_VOICE_OPTIONS;

// Helper function to get a random voice (excluding the 'random' option itself)
export const getRandomVoice = (): string => {
  const actualVoices = GEMINI_VOICE_OPTIONS.filter(v => v.id !== 'random');
  const randomIndex = Math.floor(Math.random() * actualVoices.length);
  return actualVoices[randomIndex].id;
};
