import { useCartStore } from "@/store/cart.store";
import type { CartItemType } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { increaseQty, removeItem, decreaseQty } = useCartStore();

  const handleIncrease = () => {
    if (!item || !item.id) {
      console.warn("Cannot increase quantity: Invalid item or missing ID");
      return;
    }
    increaseQty(item.id, item.customizations || []);
  };

  const handleDecrease = () => {
    if (!item || !item.id || item.quantity <= 1) {
      console.warn(
        "Cannot decrease quantity: Invalid item, missing ID, or quantity <= 1"
      );
      return;
    }
    decreaseQty(item.id, item.customizations || []);
  };

  // Toppings ve side options'ları ayrı ayrı filtreleme
  const toppings =
    item.customizations?.filter((c) => c.type === "topping") || [];
  const sides = item.customizations?.filter((c) => c.type === "side") || [];

  if (!item) return null;

  return (
    <View className="mb-4 mx-1 bg-white rounded-xl shadow-sm">
      <View className="flex-row items-center p-2">
        {/* Sol Taraf - Resim */}
        <Image
          source={{ uri: item.image_url }}
          className="w-14 h-14 rounded-lg mr-2"
          resizeMode="cover"
        />

        {/* Orta Kısım - Ürün Bilgileri */}
        <View className="flex-1 mr-1">
          <Text className="font-bold text-sm text-gray-900" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="font-bold text-amber-500 text-sm">
            ${item.price.toFixed(2)}
          </Text>

          {/* Customizations - Toppings ve Sides */}
          {(toppings.length > 0 || sides.length > 0) && (
            <View className="flex-row flex-wrap mt-1">
              {toppings.map((topping, index) => (
                <View
                  key={`topping-${index}`}
                  className="bg-amber-100 rounded-full px-2 py-0.5 mr-1 mb-1"
                >
                  <Text className="text-xs text-amber-800">{topping.name}</Text>
                </View>
              ))}
              {sides.map((side, index) => (
                <View
                  key={`side-${index}`}
                  className="bg-amber-100 rounded-full px-2 py-0.5 mr-1 mb-1"
                >
                  <Text className="text-xs text-amber-800">{side.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quantity Controls - Daha kompakt */}
          <View className="flex-row items-center mt-1">
            <View className="flex-row items-center border border-gray-200 rounded-full">
              <TouchableOpacity
                onPress={handleDecrease}
                className="w-7 h-7 items-center justify-center"
              >
                <Ionicons name="remove" size={16} color="#FE8C00" />
              </TouchableOpacity>

              <Text className="mx-1 font-medium text-sm">
                {item.quantity || 0}
              </Text>

              <TouchableOpacity
                onPress={handleIncrease}
                className="w-7 h-7 items-center justify-center"
              >
                <Ionicons name="add" size={16} color="#FE8C00" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sağ Taraf - Çöp Kutusu */}
        <TouchableOpacity
          onPress={() => removeItem(item.id, item.customizations || [])}
          className="bg-gray-100 rounded-full p-2 ml-1"
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartItem;
