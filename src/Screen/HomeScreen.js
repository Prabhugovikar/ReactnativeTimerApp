import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const navigation = useNavigation();
  const addTimer = async () => {
    if (!name || !duration || !category) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    const newTimer = {
      id: Date.now(),
      name,
      duration: parseInt(duration),
      remainingTime: parseInt(duration),
      category,
      isRunning: false,
      isPaused: false,
      intervalId: null,
    };

    const savedTimers = await AsyncStorage.getItem("timers");
    const timers = savedTimers ? JSON.parse(savedTimers) : [];
    await AsyncStorage.setItem("timers", JSON.stringify([...timers, newTimer]));
    setName("");
    setDuration("");
    setCategory("");
    navigation.replace("TimersListScreen");
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Timer Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Duration (seconds)" keyboardType="numeric" value={duration} onChangeText={setDuration} />
      <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
      
      <TouchableOpacity style={styles.addButton} onPress={addTimer}>
        <Text style={styles.buttonText}>➕ Create Timer</Text>
      </TouchableOpacity>

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  input: { backgroundColor: "#FFF", padding: 12, borderRadius: 8, marginVertical: 6, fontSize: 16 },
  addButton: { backgroundColor: "#ff9800", padding: 12, borderRadius: 8, marginTop: 10 },
  buttonText: { textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#FFF" },
  navigationContainer: { marginTop: 20 },
  navButton: { backgroundColor: "#007BFF", padding: 12, borderRadius: 8, marginTop: 10 },
});
