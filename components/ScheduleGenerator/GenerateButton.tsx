import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';

interface GenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function GenerateButton({ onGenerate, isGenerating }: GenerateButtonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, isGenerating && styles.buttonDisabled]}
        onPress={onGenerate}
        activeOpacity={0.8}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FFF" size="small" />
            <Text style={[styles.buttonText, styles.loadingText]}>ĐANG TÌM LỊCH...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>TÌM LỊCH HỌC PHÙ HỢP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF6B6B', // Màu sắc nổi bật
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#FFB3B3',
    shadowOpacity: 0.1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
