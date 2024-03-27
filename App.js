import { StatusBar } from 'expo-status-bar';
import {  Text, View, Animated, TouchableOpacity,  } from 'react-native';
import {useRef, useState} from 'react';
import styles from './StyleSheet/style_sheet_master';
import FlipCard from 'react-native-flip-card';
export default function App() {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
    
    let val = 0;
    animatedValue.addListener(({ value }) => {
      val = value;
    });
  
  const frontInterpolate = animatedValue.interpolate({ //
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
    <View style={styles.container}>
       <View style={{ flexDirection: 'row', }}>
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
      </View>
      <View style={styles.containerTwo}>
      <View style={{ flexDirection: 'row', }}>
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


