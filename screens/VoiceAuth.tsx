import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { useTaskContext } from '../components/TaskContext';

// Web Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type VoiceAuthProps = {
  navigation: any;
};

function VoiceAuth({ navigation }: VoiceAuthProps) {
  const { isFaceAuthenticated, isVoiceEnabled, isDarkMode, savedFaces } = useTaskContext();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [voiceAuthGranted, setVoiceAuthGranted] = useState(false);
  const [faceVerificationStatus, setFaceVerificationStatus] = useState('');

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const verifyFace = async (): Promise<boolean> => {
    // Simulate face verification using saved faces
    if (savedFaces.length === 0) {
      setFaceVerificationStatus('No saved face data found');
      return false;
    }

    // In a real implementation, this would compare the current face with saved faces
    // For now, we'll simulate verification with a random success rate (80% success)
    const isVerified = Math.random() > 0.2;

    if (isVerified) {
      setFaceVerificationStatus('Face verified - Voice auth granted');
      setVoiceAuthGranted(true);
      return true;
    } else {
      setFaceVerificationStatus('Face verification failed');
      setVoiceAuthGranted(false);
      return false;
    }
  };

  const startRecording = async () => {
    if (!isFaceAuthenticated) {
      Alert.alert('Authentication Required', 'Please authenticate with face recognition first before using voice commands.');
      return;
    }

    // Require face verification each time before using voice commands
    const faceVerified = await verifyFace();
    if (!faceVerified) {
      return;
    }

    try {
      // For web platform, use Speech Recognition API
      if (Platform.OS === 'web') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }
            if (finalTranscript) {
              setTranscribedText(finalTranscript);
            }
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
          };

          recognition.start();
          setSpeechRecognition(recognition);
          setStartTime(Date.now());
          setIsRecording(true);
        } else {
          Alert.alert('Not Supported', 'Speech recognition is not supported in this browser.');
        }
      } else {
        // For mobile platforms, use Audio recording
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Microphone permission is required.');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setStartTime(Date.now());
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const transcribeAudio = async (audioUri: string) => {
    try {
      // For demo purposes, we'll simulate transcription based on audio length
      // In production, you'd send the audio file to a speech recognition service
      const duration = Math.round((Date.now() - startTime) / 1000);

      // Simulate different transcriptions based on duration
      let simulatedTranscription = '';
      if (duration < 3) {
        simulatedTranscription = 'Hello';
      } else if (duration < 6) {
        simulatedTranscription = 'Hello, this is a test recording';
      } else if (duration < 10) {
        simulatedTranscription = 'Hello, this is a longer test recording to demonstrate speech to text functionality';
      } else {
        simulatedTranscription = 'Hello, this is a very long test recording that demonstrates the speech to text functionality working properly with extended audio input';
      }

      setTranscribedText(simulatedTranscription);
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscribedText('Error transcribing audio');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);

    if (Platform.OS === 'web' && speechRecognition) {
      speechRecognition.stop();
      setSpeechRecognition(null);
      Alert.alert('Recording Stopped', 'Voice recorded and transcribed.');
    } else if (recording) {
      try {
        const status = await recording.getStatusAsync();
        console.log('Recording status before stop:', status);

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording URI:', uri);

        // Get final status after stopping
        const finalStatus = await recording.getStatusAsync();
        console.log('Recording status after stop:', finalStatus);

        // Transcribe the audio
        await transcribeAudio(uri!);

        Alert.alert('Recording Stopped', 'Voice recorded and transcribed.');
      } catch (error) {
        console.error('Failed to stop recording', error);
      }
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>Voice Command to a Bot</Text>
      {!isFaceAuthenticated && (
        <View style={styles.authWarning}>
          <Text style={styles.authWarningText}>
            ⚠️ Face authentication required to enable voice commands
          </Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.voiceButton,
            isRecording && styles.recordingVoiceButton,
            !isFaceAuthenticated && styles.disabledVoiceButton,
            pressed && isFaceAuthenticated && styles.pressedVoiceButton
          ]}
          onPressIn={isRecording ? undefined : startRecording}
          onPressOut={isRecording ? stopRecording : undefined}
          disabled={!isFaceAuthenticated}
        >
          <Text style={styles.voiceButtonText}>
            {isRecording ? '🎤' : '🎙️'}
          </Text>
        </Pressable>
        <Text style={[styles.buttonLabel, isDarkMode && styles.darkText]}>
          {isRecording ? 'Recording... Tap to Stop' : 'Hold to Record'}
        </Text>
      </View>
      <Text style={styles.status}>
        Status: {isRecording ? 'Recording...' : 'Not Recording'}
      </Text>
      {faceVerificationStatus ? (
        <View style={[styles.authStatus, voiceAuthGranted ? styles.authGranted : styles.authFailed]}>
          <Text style={styles.authStatusText}>
            {faceVerificationStatus}
          </Text>
        </View>
      ) : null}
      <View style={styles.transcriptionContainer}>
        <Text style={styles.transcriptionTitle}>Transcribed Text:</Text>
        <Text style={styles.transcriptionText}>
          {transcribedText || 'No transcription yet. Start recording to see speech-to-text.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Light blue background
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#121212', // Dark background
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D47A1', // Dark blue
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  darkText: {
    color: '#FFFFFF', // White text for dark mode
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  voiceButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D32F2F', // Red when not pressed
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  recordingVoiceButton: {
    backgroundColor: '#4CAF50', // Green when recording
    shadowColor: '#4CAF50',
  },
  disabledVoiceButton: {
    backgroundColor: '#BDBDBD', // Gray when disabled
    shadowColor: '#BDBDBD',
  },
  pressedVoiceButton: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.1,
  },
  voiceButtonText: {
    fontSize: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D47A1',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  button: {
    backgroundColor: '#1976D2', // Medical blue
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  recordingButton: {
    backgroundColor: '#D32F2F', // Red for recording
    shadowColor: '#D32F2F',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD', // Gray for disabled
    shadowColor: '#BDBDBD',
  },
  authWarning: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  authWarningText: {
    color: '#E65100',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  transcriptionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  transcriptionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D47A1',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  authStatus: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  authGranted: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  authFailed: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  authStatusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default VoiceAuth;
