import { CartCustomization, CartStore } from "@/type";
import { create } from "zustand";

function areCustomizationsEqual(
  a: CartCustomization[] = [],
  b: CartCustomization[] = []
): boolean {
  if (a.length !== b.length) return false;

  // Null kontrolü ekleyerek localeCompare hatası önleniyor
  const aSorted = [...a].sort((x, y) => {
    // Null/undefined kontrolü
    const xId = x?.id?.toString() || "";
    const yId = y?.id?.toString() || "";
    return xId.localeCompare(yId);
  });

  const bSorted = [...b].sort((x, y) => {
    // Null/undefined kontrolü
    const xId = x?.id?.toString() || "";
    const yId = y?.id?.toString() || "";
    return xId.localeCompare(yId);
  });

  // ID karşılaştırması için de null kontrolü
  return aSorted.every((item, idx) => {
    const aId = item?.id?.toString() || "";
    const bId = bSorted[idx]?.id?.toString() || "";
    return aId === bId;
  });
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const customizations = item.customizations ?? [];

    const existing = get().items.find(
      (i) =>
        i.id === item.id &&
        areCustomizationsEqual(i.customizations ?? [], customizations)
    );

    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === item.id &&
          areCustomizationsEqual(i.customizations ?? [], customizations)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({
        items: [...get().items, { ...item, quantity: 1, customizations }],
      });
    }
  },

  // Sepete ürün eklemek için
  addToCart: (product: any) => {
    set((state) => {
      // Mevcut sepet öğelerini kopyala
      const updatedItems = [...state.items];

      // Aynı ürün ve topping'lerle eşleşen öğe var mı diye kontrol et
      const existingItemIndex = updatedItems.findIndex((item) => {
        // Ürün ID kontrolü
        if (item.id !== product.id) return false;

        // Topping'ler yoksa sadece ürün ID'si yeterli
        if (!item.selectedToppings && !product.selectedToppings) return true;

        // Sadece bir tarafta topping varsa eşleşme yok
        if (!item.selectedToppings || !product.selectedToppings) return false;

        // Topping sayıları aynı değilse eşleşme yok
        if (item.selectedToppings.length !== product.selectedToppings.length)
          return false;

        // Topping ID'lerini karşılaştır
        const itemToppingIds = item.selectedToppings
          .map((t: { id: any }) => t.id)
          .sort();
        const productToppingIds = product.selectedToppings
          .map((t: { id: any }) => t.id)
          .sort();

        // Tüm topping'ler eşleşiyor mu kontrol et
        return itemToppingIds.every(
          (id: any, i: string | number) => id === productToppingIds[i]
        );
      });

      if (existingItemIndex > -1) {
        // Eşleşen ürün bulunduysa miktarını artır
        updatedItems[existingItemIndex].quantity += product.quantity || 1;
        return { items: updatedItems };
      } else {
        // Eşleşen ürün bulunamadıysa yeni ekle
        const newItem = {
          ...product,
          quantity: product.quantity || 1,
          // Benzersiz cartItemId ekle
          cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        return { items: [...updatedItems, newItem] };
      }
    });
  },

  removeItem: (id, customizations = []) => {
    set({
      items: get().items.filter(
        (i) =>
          !(
            i.id === id &&
            areCustomizationsEqual(i.customizations ?? [], customizations)
          )
      ),
    });
  },

  increaseQty: (id, customizations = []) => {
    set({
      items: get().items.map((i) =>
        i.id === id &&
        areCustomizationsEqual(i.customizations ?? [], customizations)
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ),
    });
  },

  decreaseQty: (id, customizations = []) => {
    set({
      items: get()
        .items.map((i) =>
          i.id === id &&
          areCustomizationsEqual(i.customizations ?? [], customizations)
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    });
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),

  getTotalPrice: () =>
    get().items.reduce((total, item) => {
      const base = item.price;
      const customPrice =
        item.customizations?.reduce(
          (s: number, c: CartCustomization) => s + c.price,
          0
        ) ?? 0;
      return total + item.quantity * (base + customPrice);
    }, 0),
}));
