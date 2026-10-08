import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
  onMicPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search destination...',
  onSubmitEditing,
  onMicPress,
}) => {
  const handleMicPress = () => {
    if (onMicPress) {
      onMicPress();
    } else {
      Alert.alert('Voice Search', 'Listening for destination name...');
    }
  };

  return (
    <View style={styles.container}>
      <Feather
        name="search"
        size={20}
        color={colors.textMuted}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        autoCorrect={false}
      />
      {value.length > 0 ? (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleMicPress}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Feather name="mic" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    paddingVertical: 0,
  },
  actionBtn: {
    padding: 6,
  },
});
