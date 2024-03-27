import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
    backgroundColor: '#fff',
    alignItems: 'flex-start', // Align items to the end of the container (right)
    justifyContent: 'flex-start', // Justify content to start of the container (top)
    paddingTop: 60, // Add some padding to keep card away from the edge of the screen
  },
  containerTwo:{
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,

  },
  card: {
    width: 150, // Adjust width
    height: 200, // Adjust height
    borderRadius: 10, // Adjust border radius
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white', // Background color
    shadowColor: "#000", // Shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow radius
    elevation: 5, // Elevation for Android
  },
  back: {
    backgroundColor: 'blue',
  },
  face: {
    backgroundColor: 'red',
  },
});

export default styles;
