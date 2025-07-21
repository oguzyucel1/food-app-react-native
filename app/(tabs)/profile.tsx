import CustomHeader from "@/components/CustomHeader";
import {
  appwriteConfig,
  getCurrentUser,
  logoutUser,
  uploadProfileImage,
} from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { ProfileItemData, User } from "@/type"; // Interface'leri import ediyoruz
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileImage = ({
  imageUrl,
  onPress,
  isLoading,
}: {
  imageUrl: string;
  onPress: () => void;
  isLoading?: boolean;
}) => {
  // Önceki URL'yi bir ref'te saklayın
  const prevImageUrlRef = React.useRef(imageUrl);

  // URL boş gelirse önceki URL'yi kullan
  const displayUrl = imageUrl || prevImageUrlRef.current;

  // Geçerli bir URL varsa, onu kaydet
  React.useEffect(() => {
    if (imageUrl) {
      prevImageUrlRef.current = imageUrl;
    }
  }, [imageUrl]);

  return (
    <View className="items-center justify-center mt-2 mb-5">
      <TouchableOpacity
        onPress={onPress}
        className="relative"
        disabled={isLoading}
      >
        {/* URL boşsa veya hatalıysa varsayılan bir avatar göster */}
        {!displayUrl || displayUrl === "" ? (
          <View
            className="w-28 h-28 rounded-full bg-amber-100 items-center justify-center"
            style={{ borderWidth: 3, borderColor: "#FE8C00" }}
          >
            <Ionicons name="person" size={50} color="#FE8C00" />
          </View>
        ) : (
          <Image
            source={{
              uri: displayUrl,
              // cache: "reload" yerine cache: "force-cache" kullanın
              cache: "force-cache",
            }}
            onError={(e) =>
              console.log("Image loading error:", e.nativeEvent.error)
            }
            className="w-28 h-28 rounded-full"
            style={{
              borderWidth: 3,
              borderColor: "#FE8C00",
            }}
          />
        )}

        {/* Loading indicator stays inside the image bounds */}
        {isLoading && (
          <View className="absolute w-28 h-28 rounded-full items-center justify-center bg-black/30">
            <ActivityIndicator color="#FE8C00" size="large" />
          </View>
        )}

        {/* Pencil icon always shows (not conditional on loading) */}
        <View className="absolute bottom-0 right-0 bg-amber-500 p-2 rounded-full">
          <Ionicons name="pencil" size={14} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ProfileItem = ({ item }: { item: ProfileItemData }) => {
  // ProfileItem kodları aynı kalıyor
  if (item.isSection) {
    return (
      <Text className="text-lg font-bold my-4 ml-2 text-gray-700">
        {item.title}
      </Text>
    );
  }

  return (
    <TouchableOpacity
      onPress={item.onPress}
      className="flex-row items-center mb-5 bg-white p-4 rounded-2xl"
      activeOpacity={item.onPress ? 0.7 : 1}
      style={styles.cardShadow}
    >
      <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center mr-4">
        {item.icon}
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs mb-1">{item.title}</Text>
        <Text className="text-gray-800 font-semibold">{item.value}</Text>
      </View>
      {item.showArrow && (
        <View className="bg-white-100 w-8 h-8 items-center justify-center rounded-full">
          <Ionicons name="chevron-forward" size={18} color="#FE8C00" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const LogoutButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className="mt-6 mb-5 py-4 bg-red-600 rounded-2xl flex-row items-center justify-center"
    style={styles.cardShadow}
  >
    <MaterialIcons name="logout" size={22} color="white" />
    <Text className="text-white font-semibold text-lg ml-2">Log Out</Text>
  </TouchableOpacity>
);

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();
  const [profileItems, setProfileItems] = useState<ProfileItemData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Yeni state ekleyin

  // Move fetchUserData outside useEffect so it's accessible everywhere
  const fetchUserData = async () => {
    try {
      // Loading durumunu sadece ilk yüklemede true yap, refresh sırasında değil
      if (!refreshing) {
        setLoading(true);
      }

      const currentUser = await getCurrentUser();
      if (currentUser) {
        // Mevcut kullanıcı verilerini saklayın
        const oldImageUrl = user?.imageUrl;

        // URL'yi doğru şekilde oluştur
        let profileImageUrl = "";
        if (currentUser.profileImageUrl) {
          if (currentUser.profileImageUrl.includes("?project=")) {
            profileImageUrl = currentUser.profileImageUrl;
          } else {
            profileImageUrl = `${currentUser.profileImageUrl}?project=${appwriteConfig.projectId}`;
          }
        }

        // Kullanıcı verilerini oluştur
        const userData: User = {
          $id: currentUser.$id,
          $collectionId: currentUser.$collectionId ?? "",
          $databaseId: currentUser.$databaseId ?? "",
          $createdAt: currentUser.$createdAt ?? "",
          $updatedAt: currentUser.$updatedAt ?? "",
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || "+1 555 123 4567",
          address:
            currentUser.address || "123 Main Street, Springfield, IL 62704",
          // Refresh sırasında imageUrl boş gelirse eski URL'yi kullan
          imageUrl:
            profileImageUrl ||
            oldImageUrl ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(currentUser.name),
          avatar: currentUser.avatar ?? "",
          profileImageUrl: currentUser.profileImageUrl ?? "",
          $permissions: [],
        };

        // Sadece veri değişmişse state'i güncelle
        if (JSON.stringify(user) !== JSON.stringify(userData)) {
          setUser(userData);
          createProfileItems(userData);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    } else {
      router.replace("/sign-in");
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const createProfileItems = (userData: User) => {
    const items: ProfileItemData[] = [
      {
        id: "section-personal",
        icon: null,
        title: "Kişisel Bilgiler",
        value: "",
        isSection: true,
      },

      {
        id: "name",
        icon: <Ionicons name="person" size={20} color="#FE8C00" />,
        title: "Full Name",
        value: userData.name,
      },
      {
        id: "email",
        icon: <Ionicons name="mail" size={20} color="#FE8C00" />,
        title: "E-mail",
        value: userData.email,
      },
      {
        id: "phone",
        icon: <Ionicons name="call" size={20} color="#FE8C00" />,
        title: "Phone Number",
        value: userData.phone || "Telefon eklenmedi",
      },
      {
        id: "address",
        icon: <Ionicons name="location" size={20} color="#FE8C00" />,
        title: "Address",
        value: userData.address || "Adres eklenmedi",
      },

      {
        id: "section-account",
        icon: null,
        title: "Account Settings",
        value: "",
        isSection: true,
      },
      // Hesap İşlemleri Öğeleri
      {
        id: "settings",
        icon: <Ionicons name="settings-outline" size={20} color="#FE8C00" />,
        title: "Settings",
        value: "Notifications, Language, etc.",
        showArrow: true,
      },
      {
        id: "payment",
        icon: <Ionicons name="card-outline" size={20} color="#FE8C00" />,
        title: "Payment Methods",
        value: "Credit/Debit Cards",
        showArrow: true,
      },
      {
        id: "history",
        icon: <FontAwesome5 name="history" size={18} color="#FE8C00" />,
        title: "Order History",
        value: "View Past Orders",
        showArrow: true,
        onPress: () => router.push("/pastOrders"), // Bu satırı ekle
      },
    ];

    setProfileItems(items);
  };

  // handleImagePick fonksiyonunu güncelleyin
  const handleImagePick = async () => {
    try {
      // İzinleri kontrol et
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "İzin Gerekli",
          "Fotoğraf seçmek için galeri erişim izni gerekiyor."
        );
        return;
      }

      // Fotoğraf seçiciyi aç - güncellenmiş yapılandırma
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return; // Kullanıcı iptal etti
      }

      const imageAsset = result.assets[0];
      const uri = imageAsset.uri;

      setUploading(true);

      try {
        // Eğer kullanıcı ID'si yoksa hata fırlat
        if (!user || !user.$id) {
          throw new Error("Kullanıcı kimliği bulunamadı");
        }

        // Doğrudan URI'yi kullanarak yükle (blob oluşturmadan)
        await uploadProfileImage(uri, user.$id);

        // Kullanıcı verilerini yenile
        await fetchUserData();
      } catch (error) {
        console.error("Fotoğraf yükleme hatası:", error);
        Alert.alert(
          "Hata",
          "Fotoğraf yüklenirken bir sorun oluştu: " + (error as any).message
        );
      } finally {
        setUploading(false);
      }
    } catch (error) {
      console.error("Fotoğraf seçme hatası:", error);
      Alert.alert("Hata", "Fotoğraf seçilirken bir sorun oluştu.");
      setUploading(false);
    }
  };

  // Pull to refresh için yeni fonksiyon
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserData();
    } catch (error) {
      console.error("Yenileme sırasında hata:", error);
      Alert.alert("Hata", "Profil bilgileri yenilenirken bir sorun oluştu.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#FE8C00" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={profileItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProfileItem item={item} />}
        contentContainerClassName="pb-28 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        // extraData prop'u ekleyin, böylece FlatList sadece profileItems değiştiğinde yeniden render edilir
        extraData={profileItems}
        // key prop'unu kaldırın, çünkü gereksiz yeniden render'a neden olabilir
        ListHeaderComponent={
          <>
            <CustomHeader title="My Profile" />
            <ProfileImage
              imageUrl={user.imageUrl ?? ""}
              onPress={handleImagePick}
              isLoading={uploading}
            />
          </>
        }
        ListEmptyComponent={
          <View className="items-center justify-center p-10">
            <Text className="text-gray-500">Profil bilgileri yüklenemedi.</Text>
          </View>
        }
        ListFooterComponent={<LogoutButton onPress={handleLogout} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FE8C00"]} // Android için yenileme animasyonu rengi
            tintColor="#FE8C00" // iOS için yenileme animasyonu rengi
            titleColor="#FE8C00" // iOS için yenileme metni rengi
          />
        }
      />
    </SafeAreaView>
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
  buttonShadow: {
    shadowColor: "#FE8C00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default Profile;
