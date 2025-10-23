import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useTaskContext } from '../components/TaskContext';
import { auth } from '../firebaseConfig';

type FaceAuthProps = {
  navigation: any;
};

function FaceAuth({ navigation }: FaceAuthProps) {
  const { isFaceAuthenticated, setIsFaceAuthenticated, setIsVoiceEnabled, savedFaces, setSavedFaces, userProfile, updateUserProfile } = useTaskContext();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const [faceInPosition, setFaceInPosition] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const captureFace = async () => {
    // Check if user profile is complete
    if (!userProfile.name || !userProfile.contact || !auth.currentUser?.email) {
      Alert.alert('Incomplete Profile', 'Please complete your user profile in Settings before capturing a face.');
      return;
    }

    if (savedFaces.length > 0) {
      Alert.alert(
        'Face Already Saved',
        'You already have a saved face. Do you want to change it or delete the existing one?',
        [
          { text: 'Change', onPress: () => proceedWithCapture(true) },
          { text: 'Delete', onPress: () => deleteExistingFace() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      proceedWithCapture(false);
    }
  };

  const proceedWithCapture = async (replace: boolean) => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        const faceWithDetails = { ...photo, details: { name: userProfile.name, contact: userProfile.contact, email: userProfile.email } };
        if (replace) {
          setSavedFaces([faceWithDetails]);
        } else {
          setSavedFaces([...savedFaces, faceWithDetails]);
        }
        // Update user profile with the face URI
        await updateUserProfile({ ...userProfile, faceUri: photo.uri });
        setIsFaceAuthenticated(true);
        setIsVoiceEnabled(true);
        Alert.alert('Face Authenticated', 'Face captured and authenticated. Voice commands are now enabled.');
      } catch (error) {
        Alert.alert('Error', 'Failed to capture face.');
      }
    } else {
      Alert.alert('Camera not ready', 'Please wait for camera to initialize.');
    }
  };

  const deleteExistingFace = async () => {
    setSavedFaces([]);
    await updateUserProfile({ ...userProfile, faceUri: undefined });
    setIsFaceAuthenticated(false);
    setIsVoiceEnabled(false);
    Alert.alert('Face Deleted', 'Your saved face has been deleted.');
  };

  const toggleCameraType = () => {
    setCameraType(current => current === 'back' ? 'front' : 'back');
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Face Recognition Authentication</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
        />
        <View style={styles.overlay}>
          <View style={[styles.faceGuide, faceInPosition && styles.faceGuideInPosition]} />
          <Text style={styles.faceGuideText}>
            {faceInPosition ? 'Face in position' : 'Position face in circle'}
          </Text>
        </View>
      </View>
      <Text style={styles.status}>
        Camera ready for face capture
      </Text>
      <TouchableOpacity style={styles.button} onPress={captureFace}>
        <Text style={styles.buttonText}>Capture & Save Face</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
        <Text style={styles.buttonText}>Flip Camera ({cameraType})</Text>
      </TouchableOpacity>
      <Text style={styles.savedCount}>Saved Faces: {savedFaces.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Light blue background
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D47A1', // Dark blue
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  camera: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  button: {
    backgroundColor: '#1976D2', // Medical blue
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  flipButton: {
    backgroundColor: '#388E3C', // Green for flip
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  savedCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  cameraContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    marginBottom: 24,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  faceGuideInPosition: {
    borderColor: '#4CAF50',
  },
  faceGuideText: {
    position: 'absolute',
    bottom: 20,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default FaceAuth;
