import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { logoutUser, signIn } from "@/lib/appwrite"; // logoutUser import edildi
import useAuthStore from "@/store/auth.store"; // Auth store import edildi
import * as Sentry from "@sentry/react-native";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react"; // useEffect eklendi
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();

  // Eğer kullanıcı zaten giriş yapmışsa, ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/profile");
    }
  }, [isAuthenticated]);

  const handleSessionError = async () => {
    try {
      // Mevcut oturumu sonlandır
      await logoutUser();
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.error("Error logging out user:", error);
      return false;
    }
  };

  const submit = async () => {
    const { email, password } = form;
    if (!email || !password)
      return Alert.alert("Error", "Please enter valid email and password");

    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      setIsAuthenticated(true);

      router.replace("/(tabs)/profile");
    } catch (error: any) {
      // Eğer aktif oturum hatası alırsak, oturumu sonlandırıp tekrar deneyelim
      if (error.message && error.message.includes("session is active")) {
        const logoutSuccess = await handleSessionError();

        if (logoutSuccess) {
          // Başarılı çıkış sonrası tekrar giriş deneyelim
          try {
            await signIn({ email, password });
            setIsAuthenticated(true);

            router.replace("/(tabs)/profile");
          } catch (retryError: any) {
            Alert.alert("Error", retryError.message);
            Sentry.captureEvent(retryError);
          }
        } else {
          Alert.alert("Error", "Could not sign in. Please try again later.");
        }
      } else {
        Alert.alert("Error", error.message);
        Sentry.captureEvent(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-6">Sign In</Text>

      <View className="gap-10 bg-white- rounded-lg">
        <CustomInput
          placeholder="Enter your Email"
          value={form.email}
          label="Email"
          keyboardType="email-address"
          onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        />
        <CustomInput
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, password: text }))
          }
          label="Password"
          secureTextEntry={true}
        />
        <CustomButton
          title="Sign In"
          isLoading={isSubmitting}
          onPress={submit}
        />

        <View className="flex justify-center mt-5 flex-row gap-2">
          <Text className="base-regular text-gray-100">
            Don't have an account?
          </Text>
          <Link href="/(auth)/sign-up" className="base-bold text-primary">
            Sign Up
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
