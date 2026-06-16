let audioContext = null;

export function getAudioCtx() {
  if (audioContext) return audioContext;

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  audioContext = new AudioContextConstructor();
  return audioContext;
}
