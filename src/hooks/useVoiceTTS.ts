import * as Speech from 'expo-speech';

export const useVoiceTTS = () => {
  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
    });
  };

  return { speak };
};
