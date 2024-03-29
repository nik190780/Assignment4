import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Text, Alert, Image, Vibration, Animated, Dimensions } from 'react-native';
import { Audio } from 'expo-av'; 
const pic1 = require('../assets/pic1.jpg');
const pic2 = require('../assets/pic2.jpg');
const pic3 = require('../assets/pic3.jpg');
const pic4 = require('../assets/pic4.jpg');
const pic5 = require('../assets/pic5.jpg');
const pic6 = require('../assets/pic6.jpg');
const pic7 = require('../assets/pic7.jpg');
const pic8 = require('../assets/pic8.jpg');

const screenWidth = Dimensions.get('window').width;
const cardMargin = 5;
const cardsPerRow = 4; 
const cardWidth = (screenWidth - cardMargin * 2 * cardsPerRow) / cardsPerRow;

const initialCardValues = [pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8, pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8];
export default function GameBoard() {
    


    const [unsuccessfulAttempts, setUnsuccessfulAttempts] = useState(0);
    const [cards, setCards] = useState([]);

    useEffect(() => {
        resetGame();
    }, []);
    let flipAnim = {};
    const resetGame = () => {
        const shuffledCardValues = [...initialCardValues].sort(() => Math.random() - 0.5);
        const tempCards = shuffledCardValues.map((value, index) => ({
            id: index,
            value: value,
            isFlipped: false,
            isMatched: false,
            flipAnim: new Animated.Value(0),
        }));

        // Initialize an Animated.Value for each card
        tempCards.forEach(card => {
            flipAnim[card.id] = new Animated.Value(0);
        });

        setCards(tempCards);
    };
    const startFlip = (index) => {
        // Access the flipAnim Animated.Value from the card's state directly
        const animationValue = cards[index].flipAnim;

        // Determine the current and target values for the animation
        const currentValue = cards[index].isFlipped ? 0 : 1;
        const targetValue = currentValue === 0 ? 1 : 0;

        // Update the card's flip state before starting the animation
        let tempCards = [...cards];
        tempCards[index].isFlipped = !tempCards[index].isFlipped;
        setCards(tempCards);

        // Start the animation
        Animated.spring(animationValue, {
            toValue: targetValue, // Toggle the target value
            friction: 8,
            tension: 10,
            useNativeDriver: false,
        }).start();
    };


    const [flippedIndexes, setFlippedIndexes] = useState([]);

    

    const flipCard = (index) => {
        let tempCards = [...cards];
        tempCards[index].isFlipped = true; // Flip the current card

        // If it's the second card being flipped, check for a match or flip back if not a match.
        if (flippedIndexes.length === 1) {
            const firstIndex = flippedIndexes[0];
            const secondIndex = index;

            // Ensure not the same card is clicked twice and check if the values match
            if (firstIndex !== secondIndex) {
                if (tempCards[firstIndex].value === tempCards[secondIndex].value) {
                    // It's a match
                    setUnsuccessfulAttempts(0);
                    tempCards[firstIndex].isMatched = true;
                    tempCards[secondIndex].isMatched = true;
                    setCards(tempCards); // Update state immediately for matches
                    Vibration.vibrate(2000); // Vibrate on match
                   

                    // Clear flippedIndexes for next turn
                    setFlippedIndexes([]);
                    checkForAllMatches(tempCards);
                } else {
                    // Not a match, delay then flip both cards back
                    const newAttemptsCount = unsuccessfulAttempts + 1;
                    setUnsuccessfulAttempts(newAttemptsCount);
                    if (newAttemptsCount >= 10) {

                    }
                    setTimeout(() => {
                        tempCards[firstIndex].isFlipped = false;
                        tempCards[secondIndex].isFlipped = false;

                        setCards(tempCards); // Update the cards' state after the delay
                        setFlippedIndexes([]); // Clear flippedIndexes for next turn
                        checkForAllMatches(tempCards);
                    }, 700); // Short delay to allow the player to see the second card
                }
            }
        } else {
            // This is the first card flipped in a pair, just record its index
            setFlippedIndexes([index]);
            setCards(tempCards); // Update state to reflect the flipped card
        }
    };

    const checkForAllMatches = () => {
        if (cards.every(card => card.isMatched)) {
            Alert.alert("Congratulations!", "You've matched all the cards. The game will reset.",
                [{ text: "OK", onPress: () => resetGame() }]
            );
        }
    };

    

    return (
        <View style={styles.container}>
            {cards.map((card, index) => (
                <Pressable
                    key={index}
                    onPress={() => {
                        startFlip(index);
                        flipCard(index);
                    }}
                    disabled={card.isFlipped}
                    style={{ margin: cardMargin, width: cardWidth }} // Apply margin and width here
                >
                    <Animated.View
                        style={{
                            ...styles.card,
                            transform: [{
                                rotateY: card.flipAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '180deg'],
                                }),
                            }],
                        }}
                    >
                        {card.isFlipped || card.isMatched ? (
                            <Image source={card.value} style={styles.cardImage} />
                        ) : (
                            <View style={styles.cardBack}></View>
                        )}
                    </Animated.View>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: cardMargin,
    },
    card: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden', 
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardBack: {
        width: '100%',
        height: '100%',
        backgroundColor: '#0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

