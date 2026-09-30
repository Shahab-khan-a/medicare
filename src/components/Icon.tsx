import React from 'react';
import { Ionicons, MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

export type IconType = 'ion' | 'material' | 'feather' | 'material-community';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  type?: IconType;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = colors.textPrimary,
  type = 'ion',
  style,
}) => {
  switch (type) {
    case 'material':
      return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
    case 'feather':
      return <Feather name={name as any} size={size} color={color} style={style} />;
    case 'material-community':
      return <MaterialCommunityIcons name={name as any} size={size} color={color} style={style} />;
    case 'ion':
    default:
      return <Ionicons name={name as any} size={size} color={color} style={style} />;
  }
};

export default Icon;
