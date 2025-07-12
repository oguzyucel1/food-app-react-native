import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import cn from "clsx";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock user data - replace with your actual user data store
const mockUserData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+90 555 123 4567",
  address: "123 Food Street, Istanbul",
  imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
};

const ProfileSection = ({
  title,
  icon,
  value,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  action?: () => void;
}) => {
  return (
    <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl mb-3 shadow-sm">
      <View className="flex-row items-center">
        <View className="bg-amber-50 p-2 rounded-full mr-3">{icon}</View>
        <View>
          <Text className="text-gray-400 text-xs">{title}</Text>
          <Text className="text-gray-800 font-medium">{value}</Text>
        </View>
      </View>
      {action && (
        <TouchableOpacity onPress={action}>
          <Ionicons name="chevron-forward" size={20} color="#FE8C00" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const ActionButton = ({
  title,
  icon,
  onPress,
  danger = false,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  danger?: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "flex-row items-center p-4 rounded-2xl mb-3 shadow-sm",
        danger ? "bg-red-50" : "bg-white"
      )}
    >
      <View
        className={cn(
          "p-2 rounded-full mr-3",
          danger ? "bg-red-100" : "bg-amber-50"
        )}
      >
        {icon}
      </View>
      <Text
        className={cn("font-medium", danger ? "text-red-600" : "text-gray-800")}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const Profile = () => {
  const { name, email, phone, address, imageUrl } = mockUserData;

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    // router.push('/edit-profile');
    console.log("Edit profile");
  };

  const handleAddressChange = () => {
    // Navigate to address management
    console.log("Change address");
  };

  const handlePaymentMethods = () => {
    // Navigate to payment methods
    console.log("Payment methods");
  };

  const handleOrderHistory = () => {
    // Navigate to order history
    console.log("Order history");
  };

  const handleHelpCenter = () => {
    // Navigate to help center
    console.log("Help center");
  };

  const handleLogout = () => {
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-5">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-2xl font-bold text-gray-800">My Profile</Text>
            <Text className="text-gray-500">Personal information</Text>
          </View>
          <TouchableOpacity
            onPress={handleEditProfile}
            className="bg-amber-500 p-2 rounded-full"
          >
            <Ionicons name="pencil" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="bg-white p-5 rounded-2xl mb-6 shadow-sm">
          <View className="flex-row items-center">
            <Image
              source={{ uri: imageUrl }}
              className="w-20 h-20 rounded-full mr-4"
            />
            <View>
              <Text className="text-xl font-bold text-gray-800">{name}</Text>
              <Text className="text-gray-500">{email}</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <Text className="text-lg font-semibold mb-3 text-gray-800">
          Personal Information
        </Text>

        <ProfileSection
          title="Full Name"
          icon={<Ionicons name="person" size={20} color="#FE8C00" />}
          value={name}
          action={handleEditProfile}
        />

        <ProfileSection
          title="Email"
          icon={<Ionicons name="mail" size={20} color="#FE8C00" />}
          value={email}
          action={handleEditProfile}
        />

        <ProfileSection
          title="Phone Number"
          icon={<Ionicons name="call" size={20} color="#FE8C00" />}
          value={phone}
          action={handleEditProfile}
        />

        <ProfileSection
          title="Delivery Address"
          icon={<Ionicons name="location" size={20} color="#FE8C00" />}
          value={address}
          action={handleAddressChange}
        />

        {/* Account Actions */}
        <Text className="text-lg font-semibold mt-6 mb-3 text-gray-800">
          Account
        </Text>

        <ActionButton
          title="Payment Methods"
          icon={<Ionicons name="card" size={20} color="#FE8C00" />}
          onPress={handlePaymentMethods}
        />

        <ActionButton
          title="Order History"
          icon={
            <MaterialCommunityIcons name="history" size={20} color="#FE8C00" />
          }
          onPress={handleOrderHistory}
        />

        <ActionButton
          title="Help Center"
          icon={<Ionicons name="help-circle" size={20} color="#FE8C00" />}
          onPress={handleHelpCenter}
        />

        <ActionButton
          title="Logout"
          icon={<Ionicons name="log-out" size={20} color="#FF3B30" />}
          onPress={handleLogout}
          danger
        />

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
