import React, { useEffect, useState, useRef } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Progress from 'react-native-progress';

export default function TimersListScreen({ navigation }) {
  const [timers, setTimers] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const [completedTimerName, setCompletedTimerName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const timersRef = useRef(timers);

  useEffect(() => {
    loadTimers();
  }, []);

  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  const loadTimers = async () => {
    const savedTimers = await AsyncStorage.getItem("timers");
    if (savedTimers) setTimers(JSON.parse(savedTimers));
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };



  const groupedTimers = timers.reduce((acc, timer) => {
    const category = timer.category.toLowerCase(); 
  
    acc[category] = acc[category] || [];
    acc[category].push(timer);
    return acc;
  }, {});

  const startTimer = (id) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.id === id && !timer.isRunning) {
        const intervalId = setInterval(() => {
          setTimers((prevTimers) =>
            prevTimers.map((t) => {
              if (t.id === id) {
                if (t.remainingTime === 1) {
                  clearInterval(intervalId);
                  markAsCompleted(t);
                  return { ...t, remainingTime: 0, isRunning: false, intervalId: null };
                }
                return { ...t, remainingTime: t.remainingTime - 1 };
              }
              return t;
            })
          );
        }, 1000);
        return { ...timer, isRunning: true, isPaused: false, intervalId };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };

  const pauseTimer = (id) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.id === id && timer.isRunning) {
        clearInterval(timer.intervalId);
        return { ...timer, isRunning: false, isPaused: true, intervalId: null };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };

  const resumeTimer = (id) => {
    startTimer(id);
  };

  const resetTimer = (id) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.id === id) {
        clearInterval(timer.intervalId);
        return { ...timer, remainingTime: timer.duration, isRunning: false, isPaused: false, intervalId: null };
      }
      return timer;
    });
    saveTimers(updatedTimers);
  };

  const markAsCompleted = async (completedTimer) => {
    const history = (await AsyncStorage.getItem("history")) ? JSON.parse(await AsyncStorage.getItem("history")) : [];
    const newHistoryItem = {
      id: completedTimer.id,
      name: completedTimer.name,
      completedAt: new Date().toLocaleString(),
    };
    await AsyncStorage.setItem("history", JSON.stringify([...history, newHistoryItem]));
    setCompletedTimerName(completedTimer.name);
    setModalVisible(true);
    const updatedTimers = timersRef.current.filter((timer) => timer.id !== completedTimer.id);
    await saveTimers(updatedTimers); 
  };
  

  const saveTimers = async (updatedTimers) => {
    await AsyncStorage.setItem("timers", JSON.stringify(updatedTimers));
    setTimers(updatedTimers);
    timersRef.current = updatedTimers;
  };

  const startAllTimers = () => {
    const updatedTimers = timers.map((timer) => {
      if (!timer.isRunning) {
        const intervalId = setInterval(() => {
          setTimers((prevTimers) =>
            prevTimers.map((t) => {
              if (t.id === timer.id) {
                if (t.remainingTime === 1) {
                  clearInterval(intervalId);
                  markAsCompleted(t);
                  return { ...t, remainingTime: 0, isRunning: false, intervalId: null };
                }
                return { ...t, remainingTime: t.remainingTime - 1 };
              }
              return t;
            })
          );
        }, 1000);
        return { ...timer, isRunning: true, isPaused: false, intervalId };
      }
      return timer;
    });
    saveTimers(updatedTimers);
    setExpandedCategories(Object.keys(groupedTimers).reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {}));
  };

  const pauseAllTimers = () => {
    const updatedTimers = timers.map((timer) => {
      if (timer.isRunning) {
        clearInterval(timer.intervalId);
        return { ...timer, isRunning: false, isPaused: true, intervalId: null };
      }
      return timer;
    });
    saveTimers(updatedTimers);
    setExpandedCategories(Object.keys(groupedTimers).reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {}));
  };

  const resetAllTimers = () => {
    const updatedTimers = timers.map((timer) => {
      clearInterval(timer.intervalId);
      return { ...timer, remainingTime: timer.duration, isRunning: false, isPaused: false, intervalId: null };
    });
    saveTimers(updatedTimers);
    setExpandedCategories(Object.keys(groupedTimers).reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {}));
  };

  const toggleMenu = () => {
    Animated.timing(animation, {
      toValue: menuOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuOpen(!menuOpen);
  };

  useFocusEffect(
    React.useCallback(() => {
      setMenuOpen(false);
      animation.setValue(0);
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer1}>
        <TouchableOpacity onPress={startAllTimers} style={styles.startButton}>
          <Text style={styles.buttonText}>▶ Start All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pauseAllTimers} style={styles.pauseButton}>
          <Text style={styles.buttonText}> ⏸ Pause All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetAllTimers} style={styles.resetButton}>
          <Text style={styles.buttonText}>🔄 Reset All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.flatconatiner}>
        <FlatList
          data={Object.keys(groupedTimers)}
          keyExtractor={(category) => category}
          renderItem={({ item: category }) => (
            <View style={styles.categoryContainer}>
              <TouchableOpacity onPress={() => toggleCategory(category)} style={styles.categoryHeader}>
                <Text style={styles.categoryText}>{category}</Text>
                <Text style={styles.arrow}>{expandedCategories[category] ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {expandedCategories[category] && (
                <FlatList
                  data={groupedTimers[category]}
                  keyExtractor={(timer) => timer.id.toString()}
                  renderItem={({ item }) => {
                    const progress = item.remainingTime / item.duration;
                    return (
                      <View style={styles.timerItem}>
                        <Text style={styles.timerText}>
                          {item.name} - <Text style={styles.timerTime}>{item.remainingTime}s</Text>
                        </Text>
                        <Text style={styles.status}>
                          Status:
                          {item.remainingTime === item.duration && !item.isRunning && !item.isPaused
                            ? "Not Started Yet"
                            : item.remainingTime === 0
                              ? "Completed"
                              : item.isRunning
                                ? "Running"
                                : item.isPaused
                                  ? "Paused"
                                  : "Idle"
                          }
                        </Text>

                        <View style={styles.buttonContainer}>
                          {!item.isRunning && !item.isPaused && (
                            <TouchableOpacity onPress={() => startTimer(item.id)} style={styles.startButton}>
                              <Text style={styles.buttonText}>▶ Start</Text>
                            </TouchableOpacity>
                          )}
                          {item.isRunning && (
                            <TouchableOpacity onPress={() => pauseTimer(item.id)} style={styles.pauseButton}>
                              <Text style={styles.buttonText}>⏸ Pause</Text>
                            </TouchableOpacity>
                          )}
                          {item.isPaused && (
                            <TouchableOpacity onPress={() => resumeTimer(item.id)} style={styles.resumeButton}>
                              <Text style={styles.buttonText}>▶ Resume</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => resetTimer(item.id)} style={styles.resetButton}>
                            <Text style={styles.buttonText}>🔄 Reset</Text>
                          </TouchableOpacity>
                        </View>
                        <Progress.Bar
                          progress={progress}
                          width={null}
                          height={5}
                          borderRadius={5}
                          color={progress === 1 ? '#FFA500' : '#FFA500'}
                          unfilledColor="lightgray"
                          style={styles.progressBar}
                        />
                      </View>
                    );
                  }}
                />
              )}
            </View>
          )}
        />
      </View>


      {menuOpen && (
        <>
          <Animated.View style={[styles.optionButton, {
            transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -140] }) }]
          }]}>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: "#4caf50" }]}
              onPress={() => {
                navigation.navigate("HistoryScreen")
                toggleMenu();
              }}>
              <Text style={styles.buttonText}>📜 History</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.optionButton, {
            transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) }]
          }]}>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: "#2196F3" }]} onPress={() => {
              navigation.navigate("Home");
              toggleMenu();
            }
            }>
              <Text style={styles.buttonText}>⏳ Add Timer</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      <TouchableOpacity style={styles.addButton} onPress={toggleMenu}>
        <Text style={styles.buttonText}>{menuOpen ? "✖" : "➕"}</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalMessage}>You completed</Text>
            <Text style={styles.modaltext}>{completedTimerName}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5", paddingBottom: 50 },
  flatconatiner: { paddingTop: 30 },
  categoryContainer: { marginBottom: 15, },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#6FBAFF",
    borderRadius: 8,
  },
  categoryText: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  arrow: { fontSize: 18, color: "#FFF" },
  timerItem: {
    backgroundColor: "#FFF",
    paddingTop: 12,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 5,
    marginVertical: 6,
    borderRadius: 8,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  progressBar: {
    marginTop: 10,
    marginBottom: 0,
  },
  timerText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  timerTime: { fontSize: 16, fontWeight: "bold", color: "#007BFF" },
  status: { fontSize: 14, marginTop: 4, color: "#6C757D" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  startButton: { backgroundColor: "#007BFF", padding: 10, borderRadius: 6 },
  pauseButton: { backgroundColor: "#FFA500", padding: 10, borderRadius: 6 },
  resumeButton: { backgroundColor: "#28A745", padding: 10, borderRadius: 6 },
  resetButton: { backgroundColor: "#DC3545", padding: 10, borderRadius: 6 },
  buttonText: { textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#FFF" },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 30,
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10,
  },
  optionButton: {
    position: "absolute",
    bottom: 20,
    right: 10,
    alignItems: "center",
  },
  menuItem: {
    width: 130,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  buttonContainer1: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  startButton: {
    backgroundColor: "#6FBAFF",
    padding: 10,
    borderRadius: 6
  },
  pauseButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 6
  },
  resetButton: {
    backgroundColor: "#DC3545",
    padding: 10,
    borderRadius: 6
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  modaltext: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
    fontWeight: 'bold',
    paddingTop: 5,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

