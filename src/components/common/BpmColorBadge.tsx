import { Box, Tooltip } from '@chakra-ui/react';
import { BPM_COLOR_RANGES } from '../../types';

type BpmColorBadgeProps = {
  bpm: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
};

export const BpmColorBadge = ({ bpm, size = 'md', showText = false }: BpmColorBadgeProps) => {
  const range = BPM_COLOR_RANGES.find(
    range => bpm >= range.min && bpm < range.max
  );

  const sizeMap = {
    sm: { fontSize: '16px' },
    md: { fontSize: '24px' },
    lg: { fontSize: '32px' }
  };

  if (!range) return null;

  return (
    <Tooltip label={`${range.min}-${range.max} BPM`}>
      <Box display="flex" alignItems="center">
        <span style={sizeMap[size]}>{range.emoji}</span>
        {showText && (
          <Box ml={2} fontWeight="bold">
            {bpm} BPM
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};
