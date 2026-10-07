import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface WaysureLogoProps {
  size?: number;
}

export const WaysureLogo: React.FC<WaysureLogoProps> = ({ size = 64 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Outer circular badge / ring */}
        <Circle cx="50" cy="50" r="46" fill="#14B8A6" />
        {/* Center cutout arc / triangle shaping the road pin */}
        <Path
          d="M50 14 C32 14 18 28 18 46 C18 64 36 82 50 88 C64 82 82 64 82 46 C82 28 68 14 50 14 Z"
          fill="#0D9488"
        />
        {/* Inner white circle */}
        <Circle cx="50" cy="42" r="14" fill="#FFFFFF" />
        {/* Triangular road opening at bottom of pin */}
        <Path
          d="M50 48 L36 86 L64 86 Z"
          fill="#FFFFFF"
        />
        {/* Inner emerald pinpoint */}
        <Circle cx="50" cy="42" r="7" fill="#0D9488" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
