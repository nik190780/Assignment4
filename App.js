import { StatusBar } from 'expo-status-bar';
import { Text, View, Animated, TouchableOpacity, Dimensions, ImageBackground, Button, Vibration } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import styles from './StyleSheet/style_sheet_master';
import FlipCard from 'react-native-flip-card';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
export default function App() {
    const[isFlipped, setIsFlipped] = useState(false);
    const [orientation, setOrientation] = useState(getOrientation());
    const [hasPermission, setHasPermission] = useState(null);
    const [photoUris, setPhotoUris] = useState([null, null, null, null, null, null]); // Array of photo URIs
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [currentCard, setCurrentCard] = useState(null);
    const [matchedIndexes, setMatchedIndexes] = useState([]);
    const [flippedCardIndexes, setFlippedCardIndexes] = useState([]);

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
    const handleTakePicture = () => {
        setIsCameraVisible(true);
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

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                console.error('Camera roll permission not granted!');
            }
        })();
    }, []);

   const getRandomIndex = () => {
        return Math.floor(Math.random() * photoUris.length);
    };


    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            console.error('Camera roll permission not granted!');
            return;
        }

        const emptyIndexes = photoUris.reduce((acc, uri, index) => {
            if (uri === null) {
                acc.push(index);
            }
            return acc;
        }, []);

        if (emptyIndexes.length === 0) {
            console.log('No empty flip cards available.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        console.log('Image Picker Result:', result);

        if (!result.cancelled && result.uri) {
            const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
            const newPhotoUris = [...photoUris];
            newPhotoUris[randomIndex] = result.uri;
            setPhotoUris(newPhotoUris);
            console.log('Updated photoUris:', newPhotoUris);
        }
    };




    const handleCardFlip = (index) => {
        if (flippedCardIndexes.length < 2 && !matchedIndexes.includes(index)) {
            setFlippedCardIndexes((prevFlippedCardIndexes) => [...prevFlippedCardIndexes, index]);
            setIsFlipped(true); // Flip the card
        }

        if (flippedCardIndexes.length === 1 && !matchedIndexes.includes(index)) {
            setTimeout(() => {
                if (photoUris[flippedCardIndexes[0]] === photoUris[index]) {
                    Vibration.vibrate();
                    setMatchedIndexes((prevMatchedIndexes) => [...prevMatchedIndexes, flippedCardIndexes[0], index]);
                }
                setFlippedCardIndexes([]);
                setIsFlipped(false); // Unflip the card after 1 second
            }, 1000);
        } else if (flippedCardIndexes.length === 2 && !matchedIndexes.includes(index)) {
            setFlippedCardIndexes([index]); // If more than 2 cards are flipped, reset the flipped card indexes
            setIsFlipped(true); // Flip the card
        }
    };


    return (
        <>
            {isCameraVisible ? (
                <View style={{ flex: 1 }}>
                    <Camera style={{ flex: 1 }} ref={cameraRef} />
                    <Button title="Take Photo" onPress={() => setIsCameraVisible(false)} />
                </View>
            ) : (
                <>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[...Array(6).keys()].map((index) => (
                            <TouchableOpacity key={index} onPress={() => handleCardFlip(index)} disabled={photoUris[index] === null} style={{ margin: 5, marginTop: 100 }}>
                                <View style={{ width: 100, height: 100 }}>
                                    <FlipCard style={{ width: '100%', height: '100%' }} flip={isFlipped}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'blue', width: '100%', height: '100%' }}>
                                            <Text>Front</Text>
                                        </View>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'red', width: '100%', height: '100%' }}>
                                            {photoUris[index] && <Image source={{ uri: photoUris[index] }} style={{ width: 80, height: 80 }} />}
                                            {!photoUris[index] && <Text>Back</Text>}
                                        </View>
                                    </FlipCard>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                        <TouchableOpacity onPress={handlePickImage} style={{ margin: 5 }}>
                            <View style={{ width: 100, height: 50, backgroundColor: 'green', justifyContent: 'center', alignItems: 'center' }}>
                                <Text>Choose Photos</Text>
                            </View>
                        </TouchableOpacity>
                        {/* New button to take a photo */}
                        <TouchableOpacity onPress={handleTakePicture} style={{ margin: 5 }}>
                            <View style={{ width: 100, height: 50, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center' }}>
                                <Text>Take Picture</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </>
            )}
            <StatusBar style="auto" />
        </>
    );
}