import {
  sides as predefinedSides,
  toppings as predefinedToppings,
} from "@/constants";
import { appwriteConfig, getMenuItem } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import { Customization, MenuItem } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SelectedCustomizations {
  [key: string]: {
    name: string;
    price: number;
  }[];
}

// CustomizationItem bileşenini dosyanın dışında tanımlayın ve memoize edin
const CustomizationItem = React.memo(
  ({
    item,
    type,
    isSelected,
    onToggle,
  }: {
    item: any;
    type: "toppings" | "sideOptions";
    isSelected: boolean;
    onToggle: () => void;
  }) => {
    return (
      <TouchableOpacity
        onPress={onToggle}
        className={`mr-4 items-center w-24 ${isSelected ? "opacity-100" : "opacity-80"}`}
      >
        <View
          className={`w-20 h-20 rounded-full mb-2 items-center justify-center 
        ${isSelected ? "bg-amber-100 border-2 border-amber-500" : "bg-gray-300"}`}
        >
          <Image
            source={item.image}
            className="w-16 h-16"
            resizeMode="contain"
          />
          {isSelected && (
            <View className="absolute top-0 right-0 bg-amber-500 rounded-full p-1">
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          )}
        </View>
        <Text className="text-xs text-center font-medium">{item.name}</Text>
        <Text className="text-xs text-gray-100">${item.price.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  }
);

const MenuItemDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [toppings, setToppings] = useState<any[]>([]);
  const [sideOptions, setSideOptions] = useState<any[]>([]);
  const [selectedCustomizations, setSelectedCustomizations] =
    useState<SelectedCustomizations>({
      toppings: [],
      sideOptions: [],
    });
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          setLoading(true);
          const item = await getMenuItem(id);
          setMenuItem(item as MenuItem);

          setToppings(
            predefinedToppings.map((topping) => ({
              $id: topping.name.toLowerCase().replace(/\s/g, "-"),
              name: topping.name,
              price: topping.price,
              type: "topping",
              image: topping.image,
            }))
          );

          setSideOptions(
            predefinedSides.map((side) => ({
              $id: side.name.toLowerCase().replace(/\s/g, "-"),
              name: side.name,
              price: side.price,
              type: "side",
              image: side.image,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleCustomization = (
    type: "toppings" | "sideOptions",
    item: Customization
  ) => {
    setSelectedCustomizations((prev) => {
      const currentItems = [...prev[type]];
      const existingIndex = currentItems.findIndex((i) => i.name === item.name);

      if (existingIndex >= 0) {
        // Remove if already selected
        currentItems.splice(existingIndex, 1);
      } else {
        // Add if not selected
        currentItems.push({
          name: item.name,
          price: item.price,
        });
      }

      return {
        ...prev,
        [type]: currentItems,
      };
    });
  };

  const isCustomizationSelected = (
    type: "toppings" | "sideOptions",
    name: string
  ) => {
    return selectedCustomizations[type].some((item) => item.name === name);
  };

  const calculateTotalPrice = () => {
    if (!menuItem) return "0.00";

    let total = menuItem.price * quantity;

    // Add prices of selected toppings
    selectedCustomizations.toppings.forEach((item) => {
      total += item.price * quantity;
    });

    // Add prices of selected side options
    selectedCustomizations.sideOptions.forEach((item) => {
      total += item.price * quantity;
    });

    return total.toFixed(2);
  };

  const handleAddToCart = () => {
    if (menuItem) {
      const customizations = [
        ...selectedCustomizations.toppings.map((item) => ({
          name: item.name,
          price: item.price,
          type: "topping" as const,
        })),
        ...selectedCustomizations.sideOptions.map((item) => ({
          name: item.name,
          price: item.price,
          type: "side" as const,
        })),
      ];

      addItem({
        id: menuItem.$id,
        name: menuItem.name,
        price: parseFloat(calculateTotalPrice()),
        image_url: `${menuItem.image_url}?project=${appwriteConfig.projectId}`,
        customizations,
        quantity,
      });

      router.back();
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // FlatList renderItem fonksiyonu
  const renderItem = ({
    item,
    type,
  }: {
    item: any;
    type: "toppings" | "sideOptions";
  }) => {
    const isSelected = isCustomizationSelected(type, item.name);
    const handleToggle = () => toggleCustomization(type, item);

    return (
      <CustomizationItem
        item={item}
        type={type}
        isSelected={isSelected}
        onToggle={handleToggle}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!menuItem) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Menu item not found</Text>
      </SafeAreaView>
    );
  }

  const imageUrl = `${menuItem.image_url}?project=${appwriteConfig.projectId}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-5 top-5 z-10 bg-white rounded-full p-2 shadow-md"
        >
          <Ionicons name="arrow-back" size={24} color="#FE8C00" />
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          onPress={() => router.push("/search")}
          className="absolute right-5 top-5 z-10 bg-white rounded-full p-2 shadow-md"
        >
          <Ionicons name="search" size={24} color="#FE8C00" />
        </TouchableOpacity>

        <View className="relative">
          {/* Header Image */}
          <View className="items-center justify-center mt-16 mb-4">
            <Image
              source={{ uri: imageUrl }}
              className="w-64 h-64"
              resizeMode="contain"
            />
          </View>

          {/* Content */}
          <View className="px-5 pb-32">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-2xl font-bold text-gray-800">
                {menuItem.name}
              </Text>
              <Text className="text-xl font-bold text-amber-500">
                ${calculateTotalPrice()}
              </Text>
            </View>

            {/* Rating */}
            <View className="flex-row items-center mb-4">
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star-half" size={16} color="#FFD700" />
              <Text className="ml-1 text-gray-500">4.5</Text>
              <Text className="text-gray-400 ml-2">•</Text>
              <Text className="ml-2 text-gray-500">30 mins</Text>
              <Text className="text-gray-400 ml-2">•</Text>
              <Ionicons
                name="flame"
                size={16}
                color="#FE8C00"
                className="ml-2"
              />
              <Text className="ml-1 text-gray-500">4.5</Text>
            </View>

            {/* Nutrition Info */}
            {menuItem.calories && (
              <View className="flex-row mb-4">
                <View className="bg-white-200 rounded-full px-3 py-1 mr-2">
                  <Text className="text-xs text-white-100">
                    {menuItem.calories} Calories
                  </Text>
                </View>
                <View className="bg-white-200 rounded-full px-3 py-1 mr-2">
                  <Text className="text-xs text-white-100">
                    {menuItem.protein}g Protein
                  </Text>
                </View>
              </View>
            )}
            {/* Description */}
            <View className="flex-col items-start mb-1 py-1 rounded-lg">
              <Text className="bg-slate-300 p-2.5 rounded-full mb-3 text-lg font-semibold">
                Ingredients
              </Text>
              <Text className="text-gray-700 mb-3 text-lg ml-2 font-semibold ">
                {menuItem.description}
              </Text>
            </View>

            {/* Toppings Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Toppings:</Text>
              <FlatList
                data={toppings}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.$id || item.name}
                renderItem={({ item }) =>
                  renderItem({ item, type: "toppings" })
                }
                contentContainerStyle={{ paddingBottom: 10 }}
              />
            </View>

            {/* Side Options Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Side Options:</Text>
              <FlatList
                data={sideOptions}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.$id || item.name}
                renderItem={({ item }) =>
                  renderItem({ item, type: "sideOptions" })
                }
                contentContainerStyle={{ paddingBottom: 10 }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Quantity and Add to Cart */}
      <View className="absolute bottom-8 left-0 right-0 px-5">
        {/* Beyaz arka plan ve gölge ekledik */}
        <View className="bg-white rounded-2xl p-4 border border-gray-50 ">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center border border-gray-300 rounded-full">
              <TouchableOpacity
                onPress={handleDecreaseQuantity}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="remove" size={20} color="#FE8C00" />
              </TouchableOpacity>
              <Text className="w-8 text-center font-bold">{quantity}</Text>
              <TouchableOpacity
                onPress={handleIncreaseQuantity}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="add" size={20} color="#FE8C00" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleAddToCart}
              className="bg-amber-500 py-4 px-6 rounded-full flex-1 ml-4 items-center"
            >
              <Text className="text-white font-bold text-lg">
                Add to Cart • ${calculateTotalPrice()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MenuItemDetails;
