import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import FlipCard from 'react-native-flip-card';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    const [photoUris, setPhotoUris] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);

    useEffect(() => {
        // Assuming pic1, pic2, pic3 are your images
        const pic1 = require('./assets/pic1.jpg');
        const pic2 = require('./assets/pic2.jpg');
        const pic3 = require('./assets/pic3.jpg');

        const predefinedPictures = [
            { uri: pic1, number: 1 },
            { uri: pic2, number: 2 },
            { uri: pic3, number: 3 },
        ];

        // Duplicate predefined pictures to create pairs
        const duplicatedPictures = [...predefinedPictures, ...predefinedPictures];

        // Shuffle the duplicated pictures
        const shuffledPictures = shuffleArray(duplicatedPictures);

        setPhotoUris(shuffledPictures);
    }, []);

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const handleCardFlip = (index) => {
        if (!photoUris[index] || flippedCards.length === 2 || flippedCards.includes(index)) {
            return; // Ignore clicks on disabled cards or when two cards are already flipped
        }

        const newFlippedCards = [...flippedCards, index];
        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === 2) {
            const firstCardIndex = newFlippedCards[0];
            const secondCardIndex = newFlippedCards[1];
            const firstCard = photoUris[firstCardIndex];
            const secondCard = photoUris[secondCardIndex];

            if (firstCard.number === secondCard.number) {
                // Cards matched
                setTimeout(() => {
                    setPhotoUris((prevPhotoUris) => {
                        const updatedUris = [...prevPhotoUris];
                        updatedUris[firstCardIndex] = null;
                        updatedUris[secondCardIndex] = null;
                        return updatedUris;
                    });
                    setFlippedCards([]);
                }, 1000);
            } else {
                // Cards didn't match, flip them back
                setTimeout(() => {
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    return (
        <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                {photoUris.map((photo, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleCardFlip(index)}
                        disabled={!photo || photoUris[index] === null || flippedCards.includes(index)}
                        style={{ margin: 5 }}
                    >
                        <View style={{ width: 100, height: 100 }}>
                            <FlipCard style={{ width: '100%', height: '100%' }} flip={flippedCards.includes(index)}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'blue', width: '100%', height: '100%' }}>
                                    <Text>Front</Text>
                                </View>
                                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'red', width: '100%', height: '100%' }}>
                                    {photo && <Image source={photo.uri} style={{ width: 80, height: 80 }} />}
                                    {!photo && <Text>Back</Text>}
                                </View>
                            </FlipCard>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <StatusBar style="auto" />
        </>
    );
}
