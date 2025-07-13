import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import useOrdersStore from "@/store/orders.store"; // Store'u import et
import { PaymentInfoStripeProps } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import cn from "clsx";
import React, { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Adres bilgisi gösterme bileşeni
const DeliveryAddressBar = ({ address }: { address: string }) => (
  <View>
    <Text className="text-gray-700 base-bold ml-1 mb-4">Current Address</Text>
    <View className="flex-row items-center bg-white border border-amber-500 rounded-xl px-4 py-3 mb-7">
      <Ionicons name="location" size={20} color="#FE8C00" />
      <View className="flex-1 ml-2">
        <Text className="paragraph-bold" numberOfLines={1}>
          {address}
        </Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="chevron-forward" size={18} color="#FE8C00" />
      </TouchableOpacity>
    </View>
  </View>
);

const PaymentInfoStripe = ({
  label,
  value,
  labelStyle,
  valueStyle,
}: PaymentInfoStripeProps) => (
  <View className="flex-between flex-row my-1">
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
);

// Sipariş Onay Kartı
const OrderConfirmationCard = ({
  visible,
  onClose,
  items,
  totalPrice,
  address,
}: {
  visible: boolean;
  onClose: () => void;
  items: any[];
  totalPrice: number;
  address: string;
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30 justify-end mb-6">
        <Animated.View
          style={{
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
                }),
              },
            ],
          }}
          className="bg-white rounded-t-3xl overflow-hidden"
        >
          <View className="items-center py-3">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>

          <View className="p-5">
            <View className="items-center mb-5">
              <Image
                source={images.success}
                className="w-20 h-20 mb-4"
                resizeMode="contain"
              />
              <Text className="text-xl font-bold text-gray-800 mb-1">
                Sipariş Alındı!
              </Text>
              <Text className="text-gray-500 text-center">
                Siparişiniz başarıyla alındı
              </Text>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl mb-5">
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-500">Toplam Tutar</Text>
                <Text className="font-bold">${totalPrice.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Teslimat Adresi</Text>
                <Text
                  className="font-bold text-right flex-1 ml-2"
                  numberOfLines={2}
                >
                  {address}
                </Text>
              </View>
            </View>

            {items.length > 0 && (
              <View className="mb-5">
                <Text className="font-bold text-gray-800 mb-2">
                  Sipariş Detayları
                </Text>
                {items.map((item, index) => (
                  <View
                    key={`order-item-${item.id}-${index}-${Math.random()
                      .toString(36)
                      .substr(2, 5)}`}
                    className="flex-row justify-between mb-1"
                  >
                    <Text className="text-gray-700">
                      {item.quantity}x {item.name}
                    </Text>
                    <Text className="text-gray-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <CustomButton title="Tamam" onPress={onClose} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const Cart = () => {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder } = useOrdersStore(); // Sipariş ekleme fonksiyonunu al
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const finalPrice = totalPrice + 5 - 0.5; // Teslimat ücreti + indirim

  // Adres bilgisi
  const userAddress = user?.address || "123 Main Street, Springfield, IL 62704";

  // Sipariş ver
  const placeOrder = async () => {
    setIsOrdering(true);

    // Sipariş işlemini simüle et (2 saniye bekle)
    setTimeout(() => {
      // Siparişi store'a kaydet
      addOrder({
        items: [...items], // Shallow copy ile items'ı kaydet
        totalPrice: finalPrice,
        address: userAddress,
      });

      setIsOrdering(false);
      setOrderComplete(true);
    }, 2000);
  };

  // Sipariş kartını kapat
  const closeOrderCard = () => {
    setOrderComplete(false);
    clearCart(); // Sepeti temizle
    // router.push('/'); // İsteğe bağlı: Ana sayfaya yönlendir
  };

  // Cart Header bileşeni
  const CartHeader = () => (
    <View>
      <CustomHeader title="Your Cart" />
      <DeliveryAddressBar address={userAddress} />
    </View>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => {
          // Topping eklendiğinde aynı ID'ye sahip ürünler için benzersiz key oluştur
          const toppingKey = item.selectedToppings
            ? `-${item.selectedToppings.map((t: { id: any }) => t.id).join("-")}`
            : "";

          return `${item.id}${toppingKey}-${Math.random().toString(36).substr(2, 9)}`;
        }}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={CartHeader}
        ListEmptyComponent={() => (
          <View className="items-center justify-center mt-16">
            <Image
              source={images.emptycart}
              className="w-40 h-40 object-contain"
              resizeMode="contain"
            />
            <Text className="text-center text-xl font-semibold text-gray-800 mt-6">
              Your cart is empty
            </Text>
            <Text className="text-center text-lg text-gray-500 mt-2 px-10">
              Add items to your cart to see them here.
            </Text>
          </View>
        )}
        ListFooterComponent={() =>
          totalItems > 0 && (
            <View className="gap-5">
              <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
                <Text className="h3-bold text-dark-100 mb-5">
                  Payment Summary
                </Text>

                <PaymentInfoStripe
                  label={`Total Items (${totalItems})`}
                  value={`$${totalPrice.toFixed(2)}`}
                />
                <PaymentInfoStripe label={`Delivery Fee`} value={`$5.00`} />
                <PaymentInfoStripe
                  label={`Discount`}
                  value={`- $0.50`}
                  valueStyle="!text-success"
                />
                <View className="border-t border-gray-300 my-2" />
                <PaymentInfoStripe
                  label={`Total`}
                  value={`$${finalPrice.toFixed(2)}`}
                  labelStyle="base-bold !text-dark-100"
                  valueStyle="base-bold !text-dark-100 !text-right"
                />
              </View>

              <CustomButton
                title={isOrdering ? "Processing..." : "Order Now"}
                onPress={placeOrder}
                isLoading={isOrdering}
              />
            </View>
          )
        }
      />

      {/* Sipariş Onay Kartı */}
      <OrderConfirmationCard
        visible={orderComplete}
        onClose={closeOrderCard}
        items={items}
        totalPrice={finalPrice}
        address={userAddress}
      />
    </SafeAreaView>
  );
};

export default Cart;
