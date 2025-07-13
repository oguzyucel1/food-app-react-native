import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import useOrdersStore from "@/store/orders.store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Tarih formatlama fonksiyonu
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Sipariş durumu çizimi
const OrderStatusBadge = ({ status }: { status: string }) => {
  let color = "";
  let bgColor = "";
  let statusText = "";

  switch (status) {
    case "processing":
      color = "text-amber-700";
      bgColor = "bg-amber-100";
      statusText = "Hazırlanıyor";
      break;
    case "delivered":
      color = "text-green-700";
      bgColor = "bg-green-100";
      statusText = "Teslim Edildi";
      break;
    case "cancelled":
      color = "text-red-700";
      bgColor = "bg-red-100";
      statusText = "İptal Edildi";
      break;
    default:
      color = "text-gray-700";
      bgColor = "bg-gray-100";
      statusText = "Bilinmiyor";
  }

  return (
    <View className={`px-3 py-1 rounded-full ${bgColor}`}>
      <Text className={`text-xs font-medium ${color}`}>{statusText}</Text>
    </View>
  );
};

// Sipariş kartı bileşeni
const OrderCard = ({ order }: { order: any }) => {
  return (
    <TouchableOpacity
      className="bg-white mb-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100"
      onPress={() => {
        // Sipariş detayı sayfasına yönlendirme (ileride eklenebilir)
        // router.push(`/order-details/${order.id}`);
      }}
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-800 font-bold">
            Sipariş #{order.id.substring(order.id.length - 6)}
          </Text>
          <OrderStatusBadge status={order.status} />
        </View>

        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-500">Tarih</Text>
          <Text className="text-gray-800">{formatDate(order.date)}</Text>
        </View>

        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-500">Tutar</Text>
          <Text className="text-gray-800 font-semibold">
            ${order.totalPrice.toFixed(2)}
          </Text>
        </View>

        <View className="bg-gray-50 p-3 rounded-xl mb-3">
          <Text className="text-gray-500 mb-2">Teslimat Adresi</Text>
          <Text className="text-gray-800">{order.address}</Text>
        </View>

        {/* Ürünlerin listelenmesi */}
        <View className="mb-2">
          <Text className="text-gray-500 mb-2">Sipariş İçeriği</Text>
          {order.items.slice(0, 2).map((item: any, index: number) => (
            <View
              key={`item-${index}`}
              className="flex-row justify-between mb-1"
            >
              <Text className="text-gray-700" numberOfLines={1}>
                {item.quantity}x {item.name}
              </Text>
              <Text className="text-gray-700">
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          {order.items.length > 2 && (
            <Text className="text-gray-500 text-sm mt-1">
              +{order.items.length - 2} diğer ürün
            </Text>
          )}
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <TouchableOpacity className="flex-row items-center">
            <MaterialIcons name="receipt" size={18} color="#FE8C00" />
            <Text className="text-amber-500 ml-1">Detaylar</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={18} color="#FE8C00" />
            <Text className="text-amber-500 ml-1">Yardım</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PastOrders = () => {
  const { orders } = useOrdersStore();

  return (
    <SafeAreaView className="bg-gray-50 h-full">
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={<CustomHeader title="Past Orders" />}
        ListEmptyComponent={() => (
          <View className="items-center justify-center mt-16">
            <Image
              source={images.emptyorders}
              className="w-32 h-32 object-contain"
              resizeMode="contain"
            />
            <Text className="text-center text-xl font-semibold text-gray-800 mt-6">
              Henüz sipariş vermediniz
            </Text>
            <Text className="text-center text-lg text-gray-500 mt-2 px-10">
              Siparişleriniz burada görüntülenecek
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default PastOrders;
