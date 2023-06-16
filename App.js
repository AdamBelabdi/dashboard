import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, LayoutAnimation, StatusBar,TouchableWithoutFeedback } from 'react-native';
import { useFonts } from 'expo-font';
import * as Location from 'expo-location';
import * as Sensors from 'expo-sensors';
import Speedometer, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
  Indicator,
} from 'react-native-cool-speedometer';
import { FontAwesome } from '@expo/vector-icons';
import { Stopwatch } from 'react-native-stopwatch-timer';

export default function App() {
  const [buggyDetected, setBuggyDetected] = useState(false);
  const [buggyTapCount, setBuggyTapCount] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [page, setPage] = useState('Home');
  const [isLoading, setIsLoading] = useState(true);
  const [isStopwatchStart, setIsStopwatchStart] = useState(false);
  const [resetStopwatch, setResetStopwatch] = useState(false);
  const handleStartStopwatch = () => {
    setIsStopwatchStart(!isStopwatchStart);
    setResetStopwatch(false);
  };

  const handleResetStopwatch = () => {
    setIsStopwatchStart(false);
    setResetStopwatch(true);
  };

  const BuggyText = ({ detected }) => {
  return (
    <Text style={styles.buggyText}>
      {detected ? 'Buggy à proximité.' : 'Buggy non détecté.'}
    </Text>
  );
};

  useEffect(() => {
  if (buggyTapCount >= 2 && buggyTapCount % 2 === 0) {
    setBuggyDetected(!buggyDetected); // replace this with adequate captor related code
  }
}, [buggyTapCount]);

  const handleScreenTap = () => {
    setBuggyTapCount((prevCount) => prevCount + 1);
  };

  const [fontsLoaded] = useFonts({
    'SquadaOne-Regular': require('./assets/fonts/SquadaOne-Regular.ttf'),
  });

  useEffect(() => {
    let isMounted = true;

    const calculateSpeed = (location) => {
      const { speed } = location.coords;
      const speedInKmH = (speed * 3.6).toFixed(2);
      if (isMounted) {
        setSpeed(speedInKmH);
      }
    };

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 100,
            distanceInterval: 0,
          },
          calculateSpeed
        );
      } catch (error) {
        console.log('Error while retrieving location', error);
      }
    };

    const getAltitude = async () => {
      try {
        const { status } = await Sensors.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access sensors was denied');
          return;
        }

        Sensors.watchDeviceMotionAsync(
          {
            interval: 100,
          },
          calculateAltitude
        );
      } catch (error) {
        console.log('Error while retrieving altitude', error);
      }
    };

    const delayLoading = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    getLocation();
    getAltitude();
    delayLoading();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderMarks = (value, markProps) => {
    let color = '#555';
    if (value === 180 || value === 190 || value === 200) {
      color = 'red';
    }
    return (
      <Text
        {...markProps}
        fill={color}
        fontSize={14}
        textAnchor="middle"
        fontFamily="SquadaOne-Regular"
      >
        {value.toString()}
      </Text>
    );
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const changePage = (nextPage) => {
    setIsLoading(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTimeout(() => {
      setPage(nextPage);
      setIsLoading(false);
    }, 500);
  };

  const renderPage = () => {
  if (page === 'Home') {
  return (
  <TouchableWithoutFeedback onPress={handleScreenTap}>
    <View style={styles.pageContainer}>
      {buggyDetected ? (
        <>
          <FontAwesome name="car" size={200} color="#33b249" />
          <BuggyText detected={true} />
        </>
      ) : (
        <>
          <FontAwesome name="car" size={200} color="#DC143C" />
          <BuggyText detected={false} />
        </>
      )}
    </View>
  </TouchableWithoutFeedback>
);
  } else if (page === 'Other1') {
    return (
    <View style={styles.pageContainer}>
      <View style={styles.speedometerContainer}>
        <Speedometer
          value={parseFloat(speed)}
          max={200}
          angle={180}
          fontFamily="SquadaOne-Regular"
          containerStyle={styles.speedometer}
        >
          <Background outerCircleColor="#f2f2f2" innerCircleColor="#f2f2f2" />
          <Arc arcColor="#f2f2f2" />
          <Needle needleColor="#f2f2f2" />
          <Progress fillColor="#f2f2f2" />
          <Marks
            step={10}
            renderMarks={renderMarks}
            markColor="#fff"
            markWidth={2}
            markLength={10}
          />
          <Indicator>{() => null}</Indicator>
        </Speedometer>
        <View style={styles.speedDisplayContainer}>
  <Text style={styles.speedText}>{speed} km/h</Text>
</View>
      </View>
    </View>
    );
  } else if (page === 'Other2') {
  return (
    <View style={styles.pageContainer}>
  <Stopwatch
    laps
    start={isStopwatchStart}
    reset={resetStopwatch}
    options={{
      container: {
        backgroundColor: '#152731',
        padding: 5,
        borderRadius: 5,
        width: 200,
        alignItems: 'center',
      },
      text: {
        fontSize: 30,
        color: '#fff',
        fontFamily: 'SquadaOne-Regular',
      },
      timerText: {
        fontSize: 50,
        color: '#fff',
        fontFamily: 'SquadaOne-Regular',
      },
      milliseconds: true, // Show milliseconds
    }}
  />
  <View style={styles.buttonContainer}>
    <TouchableOpacity
      style={styles.button}
      onPress={handleStartStopwatch}
    >
      <Text style={styles.buttonText}>
        {!isStopwatchStart ? 'START' : 'STOP'}
      </Text>
    </TouchableOpacity>
    <View style={styles.buttonSpacing} />
    <TouchableOpacity
      style={styles.button}
      onPress={handleResetStopwatch}
    >
      <Text style={styles.buttonText}>RESET</Text>
    </TouchableOpacity>
  </View>
</View>
    );
  }
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[
            styles.menuButton,
            page === 'Home' ? styles.menuButtonActive : null,
          ]}
          onPress={() => changePage('Home')}
        >
          <FontAwesome name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuButton,
            page === 'Other1' ? styles.menuButtonActive : null,
          ]}
          onPress={() => changePage('Other1')}
        >
          <FontAwesome name="tachometer" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuButton,
            page === 'Other2' ? styles.menuButtonActive : null,
          ]}
          onPress={() => changePage('Other2')}
        >
          <FontAwesome name="clock-o" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuButton,
            page === 'Other3' ? styles.menuButtonActive : null,
          ]}
          onPress={() => changePage('Other3')}
        >
          <FontAwesome name="cog" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {renderPage()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#152731',
  },
  speedometerContainer: {
    alignItems: 'center',
  },
  speedometer: {
    width: 300,
    height: 300,
  },
  speedText: {
    fontSize: 50,
    color: '#fff',
    fontFamily: 'SquadaOne-Regular',
    textAlign: 'center',
  },
  speedText2: {
    fontSize: 50,
    color: '#ddd',
    fontFamily: 'SquadaOne-Regular',
    marginLeft: 5,
    textAlign: 'center',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#0e1f2c',
  },
  menuButton: {
    padding: 10,
  },
  menuButtonActive: {
    backgroundColor: '#1c4b63',
    borderRadius: 5,
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageText: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'SquadaOne-Regular',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#152731',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#1c4b63',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'SquadaOne-Regular',
  },
  buttonSpacing: {
    width: 10,
  },
  buggyText: {
    fontSize: 25,
    color: '#fff',
    fontFamily: 'SquadaOne-Regular',
  },
});