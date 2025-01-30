import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../Screen/HomeScreen";
import HistoryScreen from "../Screen/HistoryScreen";
import TimersListScreen from "../Screen/TimersListScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
      initialRouteName="TimersListScreen"
        options={{ headerShown: false }} 
      
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TimersListScreen" component={TimersListScreen}  options={{ headerShown: false }}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
