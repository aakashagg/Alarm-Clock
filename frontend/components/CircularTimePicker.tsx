import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH * 0.7, 280);
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;

interface CircularTimePickerProps {
  value: number;
  maxValue: number;
  minValue?: number;
  onChange: (value: number) => void;
  label: string;
  color?: string;
}

export const CircularTimePicker: React.FC<CircularTimePickerProps> = ({
  value,
  maxValue,
  minValue = 0,
  onChange,
  label,
  color = '#4CAF50',
}) => {
  const rotation = useSharedValue(0);
  const lastRotation = useSharedValue(0);
  const lastAngle = useRef(0);
  const velocity = useRef(0);
  const lastTime = useRef(Date.now());

  // Convert value to angle (0 = top, clockwise)
  const valueToAngle = (val: number) => {
    const range = maxValue - minValue + 1;
    return ((val - minValue) / range) * 360;
  };

  // Convert angle to value
  const angleToValue = (angle: number) => {
    const range = maxValue - minValue + 1;
    let normalizedAngle = ((angle % 360) + 360) % 360;
    let val = Math.round((normalizedAngle / 360) * range) + minValue;
    
    // Handle wrap around
    if (val > maxValue) val = minValue;
    if (val < minValue) val = maxValue;
    
    return val;
  };

  const updateValue = (angle: number) => {
    const newValue = angleToValue(angle);
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const gesture = Gesture.Pan()
    .onStart((e) => {
      lastRotation.value = rotation.value;
      const centerX = CIRCLE_RADIUS;
      const centerY = CIRCLE_RADIUS;
      const x = e.x - centerX;
      const y = e.y - centerY;
      lastAngle.current = Math.atan2(y, x) * (180 / Math.PI);
      lastTime.current = Date.now();
      velocity.current = 0;
    })
    .onUpdate((e) => {
      const centerX = CIRCLE_RADIUS;
      const centerY = CIRCLE_RADIUS;
      const x = e.x - centerX;
      const y = e.y - centerY;
      const angle = Math.atan2(y, x) * (180 / Math.PI);

      // Calculate delta angle
      let deltaAngle = angle - lastAngle.current;
      
      // Handle wrap around
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      // Calculate velocity for acceleration
      const currentTime = Date.now();
      const deltaTime = Math.max(currentTime - lastTime.current, 1);
      const currentVelocity = Math.abs(deltaAngle) / deltaTime;
      velocity.current = currentVelocity;

      // Apply acceleration based on velocity
      let multiplier = 1;
      if (currentVelocity > 2) {
        // Fast swipe - accelerate
        multiplier = Math.min(currentVelocity * 0.5, 5);
      } else if (currentVelocity < 0.5) {
        // Slow drag - precise control
        multiplier = 0.3;
      }

      rotation.value = lastRotation.value + deltaAngle * multiplier;
      runOnJS(updateValue)(rotation.value);

      lastAngle.current = angle;
      lastTime.current = currentTime;
    })
    .onEnd(() => {
      lastRotation.value = rotation.value;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // Generate tick marks
  const ticks = [];
  const range = maxValue - minValue + 1;
  for (let i = 0; i < range; i++) {
    const angle = (i / range) * 360;
    const isActive = i === (value - minValue);
    ticks.push(
      <View
        key={i}
        style={[
          styles.tick,
          {
            transform: [
              { rotate: `${angle}deg` },
              { translateY: -CIRCLE_RADIUS + 15 },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.tickMark,
            isActive && { backgroundColor: color, height: 12, width: 3 },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <GestureDetector gesture={gesture}>
        <View style={[styles.circle, { width: CIRCLE_SIZE, height: CIRCLE_SIZE }]}>
          {/* Background circle */}
          <View style={[styles.circleBackground, { borderColor: color }]} />
          
          {/* Tick marks */}
          <View style={styles.ticksContainer}>
            {ticks}
          </View>
          
          {/* Center value display */}
          <View style={styles.centerValue}>
            <Text style={styles.valueText}>
              {String(value).padStart(2, '0')}
            </Text>
          </View>
          
          {/* Active indicator */}
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: color,
                transform: [{ rotate: '0deg' }, { translateY: -CIRCLE_RADIUS + 25 }],
              },
            ]}
          />
          
          {/* Gesture hint text */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Slide to adjust</Text>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    borderWidth: 2,
    backgroundColor: '#1a1a1a',
  },
  ticksContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  tick: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 2,
    height: CIRCLE_SIZE,
    marginLeft: -1,
    marginTop: -CIRCLE_SIZE / 2,
  },
  tickMark: {
    width: 2,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  centerValue: {
    width: CIRCLE_SIZE * 0.5,
    height: CIRCLE_SIZE * 0.5,
    borderRadius: 1000,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  valueText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  indicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 20,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
