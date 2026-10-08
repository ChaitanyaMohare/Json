import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';

interface WaysureLogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  variant?: 'circle' | 'original';
}

export const WaysureLogo: React.FC<WaysureLogoProps> = ({
  size = 72,
  style,
  imageStyle,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={require('../../assets/waysure_logo.png')}
        style={[
          styles.logoImage,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: {
    backgroundColor: '#FFFFFF',
  },
});
