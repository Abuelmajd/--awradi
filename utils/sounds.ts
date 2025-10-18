export const SOUND_OPTIONS = [
  { key: 'default', value: 'افتراضي' },
  { key: 'chime', value: 'رنين' },
  { key: 'tink', value: 'نغمة هادئة' },
  { key: 'alert', value: 'تنبيه' },
];

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported.");
      return null;
    }
  }
  return audioContext;
}

export const playSound = (soundKey: string = 'default') => {
  const context = getAudioContext();
  if (!context) return;
  
  // Resume context if it's suspended (required by modern browsers)
  if (context.state === 'suspended') {
    context.resume();
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.05);

  switch (soundKey) {
    case 'chime':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.2); // E5
      break;
    case 'tink':
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(1046.50, context.currentTime); // C6
      break;
    case 'alert':
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
      oscillator.frequency.setValueAtTime(880, context.currentTime + 0.1); // A5
      break;
    default: // 'default'
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
      break;
  }
  
  const duration = soundKey === 'chime' ? 0.4 : 0.2;
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
};