import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { doc, getDoc } from 'firebase/firestore';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

type Point = { x: number; y: number };
type Wall = { x: number; y: number; w: number; h: number };
type Task = { source: Point, destination: Point, status: 'in-progress' | 'in-queue' };

interface MapData {
	dateCreated: string,
	width: number;
	height: number;
	walls: Wall[];
}

function MapContainer() {
	const [mapData, setMapData] = useState<MapData | null>(null);
	const [position, setPosition] = useState<Point | null>(null);
	const [path, setPath] = useState<Point[]>([]);
	const [task, setTask] = useState<Task | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const db = getDatabase();
				const fs = getFirestore();
				const robotRef = ref(db, '/');
				const unsubscribeRealtime = onValue(robotRef, async (snapshot) => {
					const data = snapshot.val();
					if (data) {
						setPosition(data.position);
						setPath(data.path || []);
						setTask(data.task);
						if (data.mapId) {
							const mapDoc = await getDoc(doc(fs, 'maps', data.mapId));
							if (mapDoc.exists()) {
								setMapData(mapDoc.data() as MapData);
							}
						}
					}
					setLoading(false);
				});
				return () => unsubscribeRealtime();
			} catch (err) {
				setLoading(false);
				return;
			}
		};
		fetchData();
	}, []);

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Loading data...</Text>
			</View>
		);
	}

	if (!mapData) {
		return (
			<View style={styles.container}>
				<Text>No map data available</Text>
			</View>
		);
	}

	const pathString = path.length > 0 ? path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') : '';

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Robot Location</Text>
			</View>
			<View style={styles.mapContainer}>
				<Svg
					width={Math.min(mapData.width, 280)}
					height={Math.min(mapData.height, 200)}
					style={styles.map}
					viewBox={`0 0 ${mapData.width} ${mapData.height}`}
					preserveAspectRatio="xMidYMid meet"
				>
					{mapData.walls.map((wall, index) => (
						<Rect key={index} x={wall.x} y={wall.y} width={wall.w} height={wall.h} fill="#888" />
					))}
					{path.length > 0 && (
						<Path d={pathString} stroke="blue" strokeWidth="4" fill="none" />
					)}
					{task && (
						<Circle cx={task.destination.x} cy={task.destination.y} r="8" fill="blue" />
					)}
					{position && (
						<>
							<Circle cx={position.x} cy={position.y} r="8" fill="red" />
							<Circle cx={position.x} cy={position.y} r="4" fill="white" />
						</>
					)}
				</Svg>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 8,
		margin: 8,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		alignItems: 'center',
		maxHeight: 300, // Limit the height to prevent screen overflow
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
		width: '100%',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	map: {
		backgroundColor: '#f9f9f9',
		borderWidth: 1,
		borderColor: '#ccc',
		maxHeight: 250, // Further limit map height
	},
	mapContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 8,
	},
});

export default MapContainer;
