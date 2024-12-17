import React from "react";
import { StyleSheet, View } from "react-native";
import Mapbox, {MapView} from "@rnmapbox/maps";

Mapbox.setAccessToken('pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA');


const PatrolScreen = () => {
  Mapbox.setTelemetryEnabled(false);
  
  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapView style={styles.map} />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  container: {
    height: 300,
    width: 300,
    backgroundColor: "tomato"
  },
  map: {
    flex: 1
  }
});

export default PatrolScreen;