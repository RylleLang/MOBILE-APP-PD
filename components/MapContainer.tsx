import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

const MapContainer: React.FC = () => {
  // Mock robot position from dashboard
  const robotX = 43.3;
  const robotY = 18;

  // Assume map scale: 1 unit = 10 pixels, map size 100x50 units for hospital floor
  const scale = 10;
  const mapWidth = 100 * scale;
  const mapHeight = 50 * scale;

  // Robot position in pixels (Y inverted for screen coords)
  const robotPixelX = robotX * scale;
  const robotPixelY = (50 - robotY) * scale; // Invert Y

  // Mock path points: simple route with blue lines
  const pathPoints = [
    { x: 10, y: 40 }, // Start
    { x: 20, y: 35 },
    { x: 30, y: 30 },
    { x: 40, y: 25 },
    { x: 43.3, y: 18 }, // End at robot
  ];

  const renderPathLine = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const lineWidth = Math.abs(end.x - start.x) * scale;
    const lineHeight = Math.abs(end.y - start.y) * scale;
    const isHorizontal = end.y === start.y;
    const isVertical = end.x === start.x;

    if (!isHorizontal && !isVertical) return null; // For simplicity, only horizontal/vertical lines

    return (
      <View
        key={`${start.x}-${start.y}-${end.x}-${end.y}`}
        style={[
          styles.pathLine,
          {
            position: 'absolute',
            left: Math.min(start.x, end.x) * scale,
            top: Math.min((50 - start.y), (50 - end.y)) * scale,
            width: isVertical ? 4 : lineWidth,
            height: isHorizontal ? 4 : lineHeight,
            transform: [
              { translateX: isVertical ? -2 : 0 },
              { translateY: isHorizontal ? -2 : 0 },
            ],
          },
        ]}
      />
    );
  };

  const renderGridRoom = (x: number, y: number, isWall: boolean = false) => (
    <View
      key={`${x}-${y}`}
      style={[
        styles.room,
        {
          position: 'absolute',
          left: x * scale,
          top: (50 - y) * scale, // Invert Y
          width: scale,
          height: scale,
          backgroundColor: isWall ? '#9e9e9e' : 'transparent',
          borderWidth: 1,
          borderColor: '#ccc',
        },
      ]}
    />
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ width: mapWidth, height: mapHeight }}
      >
        {/* Grid Rooms/Walls - Mock hospital layout with some gray walls */}
        {Array.from({ length: 100 }, (_, x) =>
          Array.from({ length: 50 }, (_, y) => {
            // Mock walls: every 10 units horizontal/vertical, and some rooms
            if (x % 10 === 0 || y % 10 === 0 || (x > 40 && x < 50 && y > 10 && y < 20)) {
              return renderGridRoom(x, y, true);
            }
            return null;
          })
        ).flat()}

        {/* Path Lines */}
        {pathPoints.map((point, index) => {
          if (index < pathPoints.length - 1) {
            return renderPathLine(point, pathPoints[index + 1]);
          }
          return null;
        })}

        {/* Robot Location - Red Dot */}
        <View
          style={[
            styles.robotDot,
            {
              position: 'absolute',
              left: robotPixelX - 8, // Center the dot
              top: robotPixelY - 8,
            },
          ]}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#f3f3f3',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  room: {
    borderRadius: 2,
  },
  pathLine: {
    backgroundColor: '#2196f3',
    borderRadius: 2,
  },
  robotDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e53935',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MapContainer;
