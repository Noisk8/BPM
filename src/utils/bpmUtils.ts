import { BPM_COLOR_RANGES } from '../types';

/**
 * Obtiene el emoji de color para un valor específico de BPM
 * @param bpm Valor numérico del BPM
 * @returns Emoji correspondiente al rango de BPM
 */
export const getBpmColorEmoji = (bpm: number): string => {
  const range = BPM_COLOR_RANGES.find(
    range => bpm >= range.min && bpm < range.max
  );
  return range ? range.emoji : '';
};

/**
 * Obtiene el nombre del color para un valor específico de BPM
 * @param bpm Valor numérico del BPM
 * @returns Nombre del color correspondiente al rango de BPM
 */
export const getBpmColorName = (bpm: number): string => {
  const range = BPM_COLOR_RANGES.find(
    range => bpm >= range.min && bpm < range.max
  );
  return range ? range.color : '';
};

/**
 * Formatea un valor de duración en segundos a formato mm:ss
 * @param seconds Duración en segundos
 * @returns String formateado como mm:ss
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
