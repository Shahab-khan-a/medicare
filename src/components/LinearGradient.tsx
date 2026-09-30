import React from 'react';
import { ViewProps } from 'react-native';
import {
  LinearGradient as ExpoLinearGradient,
  LinearGradientProps as ExpoLinearGradientProps,
} from 'expo-linear-gradient';

interface LinearGradientProps extends ViewProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}

export const LinearGradient: React.FC<LinearGradientProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
  ...rest
}) => {
  return (
    <ExpoLinearGradient
      colors={colors as unknown as ExpoLinearGradientProps['colors']}
      start={start}
      end={end}
      style={style}
      {...rest}
    >
      {children}
    </ExpoLinearGradient>
  );
};

export default LinearGradient;
