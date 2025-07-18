import CustomButton from '@/components/CustomButton'
import CustomInput from '@/components/CustomInput'
import { createUser } from '@/lib/appwrite'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Text, View } from 'react-native'

const SıgnUp = () => {

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({name: '', email: '', password: ''})

  const submit = async () => {

    const { name, email, password } = form
    if(!name || !email || !password)
      return Alert.alert("Error", "Please enter valid email and password")

    setIsSubmitting(true)

    try {
        await createUser({
          email,
          password,
          name
        })

      Alert.alert("Success", "You have successfully signed up")
      router.replace('/')
    }
    catch (error: any) {
      Alert.alert("Error", error.message)
    }
    
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View className='gap-10 bg-white- rounded-lg p-5 mt-5'>  
     <CustomInput 
          placeholder='Enter your full name'
          value={form.name}
          label='Full Name'
          
          onChangeText={(text) => setForm((prev) => ({...prev, name: text}))}
        />
       <CustomInput 
          placeholder='Enter your email'
          value={form.email}
          label='Email'
          keyboardType='email-address'
          onChangeText={(text) => setForm((prev) => ({...prev, email: text}))}
        />
          <CustomInput 
          placeholder='Enter your password'
          value={form.password}
           onChangeText={(text) => setForm((prev) => ({...prev, password: text}))}
          label='Password'
         secureTextEntry={true}
        />
        <CustomButton 
        title ="Sign Up"
        isLoading={isSubmitting}
        onPress={submit}
        />

        <View className='flex justify-center mt-5 flex-row gap-2'>
          <Text className='base-regular text-gray-100'>Already have an account?</Text> 
          <Link href="/(auth)/sign-in" className="base-bold text-primary">Sign In</Link>

        </View>
    </View>
  )
}

export default SıgnUp