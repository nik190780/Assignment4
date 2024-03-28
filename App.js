import { StatusBar } from 'expo-status-bar';
import { Text, View, Animated, TouchableOpacity, Dimensions, ImageBackground, Button } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import styles from './StyleSheet/style_sheet_master';
import FlipCard from 'react-native-flip-card';
import { Camera } from 'expo-camera';
export default function App() {
    const[isFlipped, setIsFlipped] = useState(false);
    const [orientation, setOrientation] = useState(getOrientation());
    const [hasPermission, setHasPermission] = useState(null);
    const [photoUris, setPhotoUris] = useState([null, null, null, null]); // Array of photo URIs
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [currentCard, setCurrentCard] = useState(null); //

    const cameraRef = useRef(null);
    function getOrientation() {
        const way = Dimensions.get('screen');
        return way.height >= way.width ? 'PORTRAIT' : 'LANDSCAPE';
    }
    useEffect(() => {
        const updateOrientation = () => {
            setOrientation(getOrientation());
        };
        const remove = Dimensions.addEventListener('change', updateOrientation);
        return () => {
            remove.remove();
        };
    }, []);
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);
    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            const newPhotoUris = [...photoUris];
            newPhotoUris[currentCard] = photo.uri;
            setPhotoUris(newPhotoUris);
            setIsCameraVisible(false);
        }
    };
  const animatedValue = useRef(new Animated.Value(0)).current;
    
    let val = 0;
    animatedValue.addListener(({ value }) => {
      val = value;
    });
  
  const frontInterpolate = animatedValue.interpolate({ 
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    
  };
  const textFlip = {
    transform: [{ rotateY: backInterpolate }],
  };

    return (
        <>
            {isCameraVisible ? (
                <View style={{ flex: 1 }}>
                    <Camera style={{ flex: 1 }} ref={cameraRef} />
                    <Button title="Take Photo" onPress={takePicture} />
                </View>
            ) : (
                <>
                    <View style={styles.container}>
                        {[0, 1].map((index) => (
                            <FlipCard key={index}>
                                <Animated.View style={[styles.card, styles.face, frontAnimatedStyle]}>
                                    <Text>Front</Text>
                                    <Button title="Set Photo" onPress={() => { setCurrentCard(index); setIsCameraVisible(true); }} />
                                </Animated.View>
                                <Animated.View style={[styles.card, styles.back, backAnimatedStyle]}>
                                    {photoUris[index] ? (
                                        <ImageBackground source={{ uri: photoUris[index] }} style={{ flex: 1 }}>
                                            <Animated.Text style={textFlip}>Back</Animated.Text>
                                        </ImageBackground>
                                    ) : (
                                        <Animated.Text style={textFlip}>Back</Animated.Text>
                                    )}
                                </Animated.View>
                            </FlipCard>
                        ))}
                    </View>
                    <View style={styles.container}>
                        {[2, 3].map((index) => (
                            <FlipCard key={index}>
                                <Animated.View style={[styles.card, styles.face, frontAnimatedStyle]}>
                                    <Text>Front</Text>
                                    <Button title="Set Photo" onPress={() => { setCurrentCard(index); setIsCameraVisible(true); }} />
                                </Animated.View>
                                <Animated.View style={[styles.card, styles.back, backAnimatedStyle]}>
                                    {photoUris[index] ? (
                                        <ImageBackground source={{ uri: photoUris[index] }} style={{ flex: 1 }}>
                                            <Animated.Text style={textFlip}>Back</Animated.Text>
                                        </ImageBackground>
                                    ) : (
                                        <Animated.Text style={textFlip}>Back</Animated.Text>
                                    )}
                                </Animated.View>
                            </FlipCard>
                        ))}
                    </View>
                </>
            )}
            <View style={styles.containerTwo}>
                <View style={{ flexDirection: 'row' }}>
                    <FlipCard>
                        <Animated.View style={[styles.card, styles.face, frontAnimatedStyle]}>
                            <Text>Front</Text>
                        </Animated.View>
                        <Animated.View style={[styles.card, styles.back, backAnimatedStyle]}>
                            <Animated.Text style={textFlip}>Back</Animated.Text>
                        </Animated.View>
                    </FlipCard>
                    <FlipCard>
                        <Animated.View style={[styles.card, styles.face, frontAnimatedStyle]}>
                            <Text>Front</Text>
                        </Animated.View>
                        <Animated.View style={[styles.card, styles.back, backAnimatedStyle]}>
                            <Animated.Text style={textFlip}>Back</Animated.Text>
                        </Animated.View>
                    </FlipCard>
                </View>
                <StatusBar style="auto" />
            </View>
        </>


    );
  
}
