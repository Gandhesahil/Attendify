import {ActivityIndicator,StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function Loading() {
  return (
    <View style={styles.container}>
        {/* ActivityIndicator typically used to show a spinner or some loading animation while waiting for the completion of an asynchronous task, such as a network request. */}
        <ActivityIndicator size="large" color="#1d9bf0" />
      
      <Text>Loading</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    }
})