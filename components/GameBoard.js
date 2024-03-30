import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Text, Alert, Image, Vibration, Animated, Dimensions } from 'react-native';
import { Audio } from 'expo-av'; 
import * as SQLite from 'expo-sqlite'; 
const pic1 = require('../assets/pic1.jpg');
const pic2 = require('../assets/pic2.jpg');
const pic3 = require('../assets/pic3.jpg');
const pic4 = require('../assets/pic4.jpg');
const pic5 = require('../assets/pic5.jpg');
const pic6 = require('../assets/pic6.jpg');
const pic7 = require('../assets/pic7.jpg');
const pic8 = require('../assets/pic8.jpg');

const screenWidth = Dimensions.get('window').width;// Get the screen width
const cardMargin = 5;// Margin between cards
const cardsPerRow = 4; // Number of cards per row
const db = SQLite.openDatabase('game.db'); // Open a database



const initialCardValues = [pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8, pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8]; //16 cards array of images
export default function GameBoard() {
    const cardWidth = (screenWidth - cardMargin * 2 * cardsPerRow) / cardsPerRow; // Calculate card width
    const [score, setScore] = useState(0); // State to store the score
    const cardsPerRowLandscape = 4; // Landscape mode
    const cardsPerRowPortrait = 3; // Portrait mode, adjust as needed
    const [orientation, setOrientation] = useState('Portrait'); // State to store the orientation
    // Function to initialize the database
    const initDB = () => {
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        score INTEGER,
        lastUpdate TEXT
      );`,
                [],
                () => console.log('Table created'),
                (_, err) => console.log('Error creating table:', err)
            );
        });
    };
    // Function to load the score from the database
    const loadScore = () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM scores ORDER BY id DESC LIMIT 1', // Get the last score
                [], 
                (_, { rows }) => { // Destructure the second argument
                    if (rows.length > 0) { 
                        const lastScore = rows._array[0]; // Get the last score
                        const lastUpdate = new Date(lastScore.lastUpdate); // Last update date
                        const now = new Date(); // Current date and time
                        const oneWeekMs = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
                        // Check if the last update was within the last week
                        if (now - lastUpdate < oneWeekMs) {
                            setScore(lastScore.score); // Set the score
                        } else {
                            console.log('More than a week passed, resetting score'); // Log a message
                            saveScore(0); // Optionally reset the score
                            setScore(0); // Set the score to 0
                        }
                    }
                },
                (_, err) => console.log('Error loading scores:', err)
            );
        });
    };
    // Load the score when the component mounts
useEffect(() => {
        initDB();
        loadScore();
    }, []);
    // Function to save the score
    const saveScore = (score) => {
        const now = new Date().toISOString();
        db.transaction(tx => {
            tx.executeSql( // Insert the score and the current date and time
                'INSERT INTO scores (score, lastUpdate) VALUES (?, ?)', //
                [score, now], 
                () => console.log('Score saved'),
                (_, err) => console.log('Error saving score:', err)
            );
        });
    };
    // Function to handle orientation changes
    useEffect(() => {
        const updateOrientation = () => {
            const dim = Dimensions.get('screen');
            setOrientation(dim.width < dim.height ? 'Portrait' : 'Landscape');
        };

        const sub = Dimensions.addEventListener('change', updateOrientation);

        // Initial orientation setup
        updateOrientation();

        return () => {
            sub.remove();
        };
    }, []);
   
   

    const [unsuccessfulAttempts, setUnsuccessfulAttempts] = useState(0); // Number of unsuccessful attempts
    const [cards, setCards] = useState([]); // Array of card objects

    // Function to play a sound when the player makes an unsuccessful attempt
    async function playUnsuccessfulSound() {
        try {
            const sound = new Audio.Sound();
            await sound.loadAsync(require('../assets/Sounds/soundLoss.mp3'));
            await sound.playAsync();
        } catch (err) {
            console.error("Error playing sound: ", err);
        }
    }
    // Function to play a sound when the player wins
    async function playSuccessfulSound() {
        try {
            const sounds = new Audio.Sound();
            await sounds.loadAsync(require('../assets/Sounds/sound2.mp3'));
            await sounds.playAsync();
        } catch (error) {
            console.error("Error playing victory sound: ", error);
        }
    }

    // Reset the game when the component mounts
    useEffect(() => {
        resetGame();
    }, []);
    let flipAnim = {}; // Object to store Animated.Value for each card
    // Function to reset the game
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

        setCards(tempCards); // Update the cards' state
    };
    // Function to start the flip animation
    const startFlip = (index) => {
        // Access the flipAnim Animated.Value from the card's state directly
        const animationValue = cards[index].flipAnim;

        // Determine the current and target values for the animation
        const currentValue = cards[index].isFlipped ? 0 : 1; // If the card is flipped, the current value is 1
        const targetValue = currentValue === 0 ? 1 : 0; // If the card is flipped, the target value is 0

        // Update the card's flip state before starting the animation
        let tempCards = [...cards]; // Copy the cards array
        tempCards[index].isFlipped = !tempCards[index].isFlipped; // Toggle the flipped state
        setCards(tempCards); // Update the cards' state immediately

        // Start the animation
        Animated.spring(animationValue, {
            toValue: targetValue, // Toggle the target value
            friction: 8,
            tension: 10,
            useNativeDriver: false,
        }).start();
    };

    // State to keep track of the indexes of the flipped cards
    const [flippedIndexes, setFlippedIndexes] = useState([]);

    
    // Function to flip a card
    const flipCard = (index) => {
        let tempCards = [...cards]; // Copy the cards array
        tempCards[index].isFlipped = true; // Flip the current card

        // If it's the second card being flipped, check for a match or flip back if not a match.
        if (flippedIndexes.length === 1) { // If there's already a card flipped
            const firstIndex = flippedIndexes[0]; // Get the index of the first card
            const secondIndex = index; // Get the index of the second card

            // Ensure not the same card is clicked twice and check if the values match
            if (firstIndex !== secondIndex) { // If it's not the same card
                if (tempCards[firstIndex].value === tempCards[secondIndex].value) { 
                    // It's a match
                    setUnsuccessfulAttempts(0);
                    tempCards[firstIndex].isMatched = true; // Mark the first card as matched
                    tempCards[secondIndex].isMatched = true; // Mark the second card as matched
                    setCards(tempCards); // Update state immediately for matches
                    Vibration.vibrate(2000); // Vibrate on match
                   
                    setScore(currentScore => {
                        const newScore = currentScore + 300; // Increment the score by 300
                        saveScore(newScore); // Save the new score
                        return newScore; // Return the new score
                    });
                   
                   
                    // Clear flippedIndexes for next turn
                    setFlippedIndexes([]); 
                    checkForAllMatches(tempCards); // Check if all cards are matched

                } else {
                  
                    const newAttemptsCount = unsuccessfulAttempts + 1; // Increment the attempts count
                    setUnsuccessfulAttempts(newAttemptsCount); // Update the attempts count
                    if (newAttemptsCount >= 10) { // If the player has made 10 unsuccessful attempts
                        playUnsuccessfulSound(); // Play a sound
                        setUnsuccessfulAttempts(0); // Reset the attempts count
                    }
                    // It's not a match
                    setTimeout(() => {
                        tempCards[firstIndex].isFlipped = false;// Flip the first card back
                        tempCards[secondIndex].isFlipped = false;// Flip the second card back

                        setCards(tempCards); // Update the cards' state after the delay
                        setFlippedIndexes([]); // Clear flippedIndexes for next turn
                        
                    }, 700); // Short delay to allow the player to see the second card
                }
            }
        } else {
            // This is the first card flipped in a pair, just record its index
            setFlippedIndexes([index]);
            setCards(tempCards); // Update state to reflect the flipped card
            
        }
    };
    // Function to check if all cards are matched
    const checkForAllMatches = () => {
        if (cards.every(card => card.isMatched)) {// If all cards are matched
            Alert.alert("Congratulations!", "You've matched all the cards. The game will reset.",
                [{ text: "OK", onPress: () => resetGame() }]
            );
            playSuccessfulSound(); // play winning sound 
        }
    };

    

    return (
        <View style={styles.container}>
            <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>Score: {score}</Text>
            </View>
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
        paddingHorizontal: 5,
    },
    scoreContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
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

