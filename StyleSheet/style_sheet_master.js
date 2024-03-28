import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: 40,// Add some padding to keep card away from the edge of the screen
        paddingLeft: 60,
    },

    card: {
        height: 150,
        width: 100,

        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        margin: 10, // Add some margin to show separate cards
    },
    back: {
        position: 'absolute',
        backgroundColor: 'blue',
    },
    face: {
        position: 'absolute',
        backgroundColor: 'red',
    },
});

export default styles;
