import { useState, useEffect } from 'react';
import useSWR from 'swr';

interface CartItem {
  cart_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  cart_item_id: number | null;
  quantity: number | null;
  product_id: number | null;
  product_name: string | null;
  price: string | null;
  slug: string | null;
  thumbnail_url: string | null;
}

interface CartResponse {
  status: number;
  message: string;
  data: CartItem[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useCart = () => {
  const { data, error, isLoading, mutate } = useSWR<CartResponse>('/api/carts', fetcher);

  const items = data?.data?.filter(item => item.product_id !== null) || [];

  const total = items.reduce((sum, item) => {
    if (item.price && item.quantity) {
      return sum + parseFloat(item.price) * item.quantity;
    }
    return sum;
  }, 0);

  const updateQuantity = async (cartId: number, cartItemId: number, productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`/api/carts/update-quantity-product-in-cart?id=${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          cart_item_id: cartItemId,
          quantity: newQuantity
        }),
      });

      if (response.ok) {
        mutate();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (cartId: number, cartItemId: number, productId: number) => {
    try {
      const response = await fetch(`/api/carts/remove-product-in-cart?id=${cartId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          product_id: productId
        }),
      });

      if (response.ok) {
        mutate();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return {
    items,
    total,
    isLoading,
    error,
    updateQuantity,
    removeItem
  };
};
