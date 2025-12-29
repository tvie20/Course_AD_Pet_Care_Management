"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface Product {
  id: number
  name: string
  price: number
  category: string
  image: string
  [key: string]: any 
}

export interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  cartCount: number
  // Sửa ở đây: Cho phép nhận tham số quantity
  addToCart: (product: Product, quantity?: number) => void 
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  
  useEffect(() => {
    const savedCart = localStorage.getItem("shopping-cart")
    if (savedCart) {
      try { setItems(JSON.parse(savedCart)) } catch (e) { console.error(e) }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("shopping-cart", JSON.stringify(items))
  }, [items])

  // --- LOGIC QUAN TRỌNG: XỬ LÝ SỐ LƯỢNG ---
  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      if (existingItem) {
        // Nếu có rồi -> Cộng dồn số lượng bạn gửi vào
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        )
      }
      // Nếu chưa có -> Thêm mới với số lượng bạn gửi vào
      return [...prevItems, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return 
    setItems((prevItems) => prevItems.map((item) => item.id === productId ? { ...item, quantity } : item))
  }

  const clearCart = () => setItems([])
  const cartCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, cartCount, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}