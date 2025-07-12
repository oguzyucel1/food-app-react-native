import { appwriteConfig, getCurrentUser, logoutUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Kullanıcı tipi tanımlama
interface User {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  imageUrl?: string;
}

const ProfileItem = ({
  icon,
  title,
  value,
  showArrow = false,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  showArrow?: boolean;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center mb-5 bg-white p-4 rounded-2xl"
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.cardShadow}
    >
      <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs mb-1">{title}</Text>
        <Text className="text-gray-800 font-semibold">{value}</Text>
      </View>
      {showArrow && (
        <View className="bg-gray-100 w-8 h-8 items-center justify-center rounded-full">
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();
  const navigation = useNavigation();

  // Back button ve profil başlığı için
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Profile",
      headerTitleAlign: "center",
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser({
            $id: currentUser.$id,
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone || "+1 555 123 4567",
            address:
              currentUser.address || "123 Main Street, Springfield, IL 62704",
            imageUrl: currentUser.profileImageUrl
              ? `${currentUser.profileImageUrl}?project=${appwriteConfig.projectId}`
              : "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(currentUser.name),
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    } else {
      router.replace("/sign-in");
    }
  }, [isAuthenticated]);

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#FE8C00" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  // Login required için modern versiyon:
  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <View className="bg-amber-50 rounded-full p-6 mb-8">
          <Ionicons name="person" size={60} color="#FE8C00" />
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-3">
          Oturum Açın
        </Text>
        <Text className="text-gray-500 mb-10 text-center">
          Profilinize erişmek için lütfen oturum açın
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/sign-in")}
          className="bg-amber-500 py-4 px-8 rounded-xl w-full items-center"
          style={styles.buttonShadow}
        >
          <Text className="text-white font-bold text-lg">Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Profile Header - Gradient Background */}
      <View
        className="bg-amber-500 pt-10 pb-16 rounded-b-[40px]"
        style={styles.headerShadow}
      >
        <View className="px-5 flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">Profilim</Text>
          <TouchableOpacity
            onPress={handleEditProfile}
            className="bg-white/25 p-2 rounded-xl"
          >
            <Ionicons name="pencil" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Avatar - Positioned on the header */}
      <View className="items-center mt-[-50]" style={styles.avatarContainer}>
        <View className="bg-white p-1 rounded-full shadow-lg">
          <Image
            source={{ uri: user.imageUrl }}
            className="w-24 h-24 rounded-full"
          />
          <View className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white items-center justify-center">
            <Ionicons name="checkmark" size={14} color="white" />
          </View>
        </View>
        <Text className="text-lg font-bold mt-3">{user.name}</Text>
        <Text className="text-gray-500 text-sm">{user.email}</Text>
      </View>

      {/* Profile Details */}
      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-lg font-bold mb-4 ml-2 text-gray-700">
          Kişisel Bilgiler
        </Text>

        <ProfileItem
          icon={<Ionicons name="person" size={20} color="#FE8C00" />}
          title="Tam Ad"
          value={user.name}
          showArrow
          onPress={handleEditProfile}
        />

        <ProfileItem
          icon={<Ionicons name="mail" size={20} color="#FE8C00" />}
          title="E-posta Adresi"
          value={user.email}
          showArrow
        />

        <ProfileItem
          icon={<Ionicons name="call" size={20} color="#FE8C00" />}
          title="Telefon Numarası"
          value={user.phone || "Telefon eklenmedi"}
          showArrow
        />

        <ProfileItem
          icon={<Ionicons name="location" size={20} color="#FE8C00" />}
          title="Ev Adresi"
          value={user.address || "Adres eklenmedi"}
          showArrow
        />

        <Text className="text-lg font-bold mt-4 mb-4 ml-2 text-gray-700">
          Hesap İşlemleri
        </Text>

        <ProfileItem
          icon={<Ionicons name="settings-outline" size={20} color="#FE8C00" />}
          title="Hesap Ayarları"
          value="Bildirim, gizlilik ve güvenlik"
          showArrow
        />

        <ProfileItem
          icon={<Ionicons name="card-outline" size={20} color="#FE8C00" />}
          title="Ödeme Yöntemleri"
          value="Kayıtlı kartlarınız ve hesaplarınız"
          showArrow
        />

        <ProfileItem
          icon={<FontAwesome5 name="history" size={18} color="#FE8C00" />}
          title="Sipariş Geçmişi"
          value="Önceki siparişlerinizi görüntüleyin"
          showArrow
        />

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-6 mb-40 py-4 bg-white rounded-2xl flex-row items-center justify-center "
          style={styles.cardShadow}
        >
          <MaterialIcons name="logout" size={22} color="#FF3B30" />
          <Text className="text-red-500 font-semibold text-lg ml-2">
            Çıkış Yap
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerShadow: {
    shadowColor: "#FE8C00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 2,
  },
  buttonShadow: {
    shadowColor: "#FE8C00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default Profile;
