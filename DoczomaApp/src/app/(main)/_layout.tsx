import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { FA5Style } from '@expo/vector-icons/build/FontAwesome5'

const MainLayout = () => {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name='index' />
      <Stack.Screen name='profile' />
      <Stack.Screen name='plan' />
    </Stack>
  )
}

export default MainLayout