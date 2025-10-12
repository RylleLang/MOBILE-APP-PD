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
			<Text style={styles.title}>Robot Location</Text>
			<Svg width={mapData.width} height={mapData.height} style={styles.map}>
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
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 8,
		margin: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		alignItems: 'center',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	map: {
		backgroundColor: '#f9f9f9',
		borderWidth: 1,
		borderColor: '#ccc',
	},
});

export default MapContainer;
