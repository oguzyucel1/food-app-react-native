import { Redirect, Slot } from 'expo-router'
import React from 'react'

export default function _layout() {

    const isAuthenticated = false // Replace with actual authentication logic

    if (!isAuthenticated) {
        // Redirect to the sign-up page if not authenticated
        return <Redirect href="/sign-in" />
    }
  return <Slot />
}