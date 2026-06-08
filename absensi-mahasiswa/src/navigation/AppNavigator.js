import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Platform } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import InputScreen from '../screens/InputScreen';
import DataScreen from '../screens/DataScreen';
import SearchScreen from '../screens/SearchScreen';
import StatsScreen from '../screens/StatsScreen';

import colors from '../styles/colors';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colors.surfaceContainerLowest,
        },
        headerStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          ...Platform.select({
            ios: {
              fontWeight: '600',
            },
            android: {
              fontWeight: '600',
            },
          }),
          color: colors.onSurface,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="dashboard" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Input"
        component={InputScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="input" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Data"
        component={DataScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="bar-chart" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}