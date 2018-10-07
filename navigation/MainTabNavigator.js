import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import CardsScreen from '../screens/CardsScreen';
import CameraScreen from '../screens/CameraScreen';
import FiltersScreen from '../screens/FiltersScreen';

const CardsStack = createStackNavigator({
  Cards: CardsScreen,
});

CardsStack.navigationOptions = {
  tabBarLabel: 'Cards',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name="triangle"/*
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }*/
    />
  ),
};

const CameraStack = createStackNavigator({
  Camera: CameraScreen,
});

CameraStack.navigationOptions = {
  tabBarLabel: 'Camera',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name="square" /*{Platform.OS === 'ios' ? `ios-link${focused ? '' : '-outline'}` : 'md-link'}*/
    />
  ),
};

const FiltersStack = createStackNavigator({
  Filters: FiltersScreen,
});

FiltersStack.navigationOptions = {
  tabBarLabel: 'Filters',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name="hexagon" 
      /*{Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options'}*/
    />
  ),
};

export default createBottomTabNavigator({
  CardsStack,
  CameraStack,
  FiltersStack,
});
