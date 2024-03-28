import { StatusBar } from 'expo-status-bar';
import { Text, View, Animated, TouchableOpacity, Dimensions, ImageBackground, Button, Vibration, Image } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import styles from './StyleSheet/style_sheet_master';
import FlipCard from 'react-native-flip-card';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
export default function App() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [orientation, setOrientation] = useState(getOrientation());
    const [hasPermission, setHasPermission] = useState(null);
    const [photoUris, setPhotoUris] = useState([null, null, null, null, null, null]); // Array of photo URIs
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [currentCard, setCurrentCard] = useState(null);
    const [matchedIndexes, setMatchedIndexes] = useState([]);
    const [flippedCardIndexes, setFlippedCardIndexes] = useState([]);
    const [matchedBoxes, setMatchedBoxes] = useState(Array(6).fill(false));


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
            // Assign the photo to the currentCard in the top row
            newPhotoUris[currentCard] = photo.uri;
            setPhotoUris(newPhotoUris);
            setIsCameraVisible(false);

            // If all top row boxes have a picture, assign pictures to the bottom row
            if (newPhotoUris.slice(0, 3).every(uri => uri !== null)) {
                const shuffledTopRowPictures = shuffleArray(newPhotoUris.slice(0, 3));
                setPhotoUris([...newPhotoUris.slice(0, 3), ...shuffledTopRowPictures]);
            }
        }
    };
    const handleTakePicture = () => {
        setIsCameraVisible(true);
        // Set the currentCard to the next top row card that doesn't have a picture yet
        const nextCard = photoUris.findIndex((uri, index) => uri === null && index < 3);
        if (nextCard !== -1) {
            setCurrentCard(nextCard);
        } else {
            console.log('All top row cards have a picture.');
        }
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
   

    const animatedValue = useRef(new Animated.Value(0)).current;

    let val = 0;
    animatedValue.addListener(({ value }) => {
        val = value;
    });





    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                console.error('Camera roll permission not granted!');
            }
        })();
    }, []);


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
    const duplicateImageToRandomCard = (uri) => {
        // Get the indices of the bottom row boxes that are null
        const emptyIndexes = photoUris.reduce((acc, uri, index) => {
            if (uri === null && index >= 3) {
                acc.push(index);
            }
            return acc;
        }, []);

        if (emptyIndexes.length === 0) {
            console.log('No empty flip cards available.');
            return;
        }

        // Randomly select a bottom flip card
        const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
        const newPhotoUris = [...photoUris];
        newPhotoUris[randomIndex] = uri;
        setPhotoUris(newPhotoUris);
        console.log('Updated photoUris:', newPhotoUris);
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
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[...Array(6).keys()].map((index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleCardFlip(index)}
                                disabled={photoUris[index] === null}
                                style={{ margin: 5, marginTop: index < 3 ? 0 : 100 }}
                            >
                                <View style={{ width: 100, height: 100 }}>
                                    <FlipCard style={{ width: '100%', height: '100%' }} flip={isFlipped}>
                                        <View
                                            style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: 'blue',
                                                width: '100%',
                                                height: '100%',
                                                opacity: matchedBoxes[index] ? 0.5 : 1,
                                            }}
                                        >
                                            <Text>Front</Text>
                                        </View>
                                        <View
                                            style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: 'red',
                                                width: '100%',
                                                height: '100%',
                                                opacity: matchedBoxes[index] ? 0.5 : 1,
                                            }}
                                        >
                                            {photoUris[index] && <Image source={{ uri: photoUris[index] }} style={{ width: 80, height: 80 }} />}
                                            {!photoUris[index] && <Text>Back</Text>}
                                        </View>
                                    </FlipCard>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                        {[...Array(3).keys()].map((index) => (
                            <TouchableOpacity key={index} onPress={() => handleTakePicture(index)} style={{ margin: 5 }}>
                                <View style={{ width: 100, height: 50, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text>Take Picture</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}
            <StatusBar style="auto" />
        </>
    );
}