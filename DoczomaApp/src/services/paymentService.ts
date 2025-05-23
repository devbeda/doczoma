import { Razorpay } from 'expo-razorpay';
import axios from 'axios';
import baseURL from '@/src/store/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const initiatePayment = async (plan: any) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userId = await AsyncStorage.getItem('userId');
    
    // 1. Create order
    const orderResponse = await axios.post(
      `${baseURL}/payments/create-order`,
      {
        amount: plan.planPrice,
        userId,
        planId: plan._id,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const order = orderResponse.data.order;

    // 2. Open Razorpay checkout
    const options = {
      description: `Payment for ${plan.planName}`,
      image: 'https://your-logo-url.png',
      currency: 'INR',
      key: 'rzp_test_YOUR_KEY_ID', // Replace with your key
      amount: order.amount,
      name: 'Your App Name',
      order_id: order.id,
      prefill: {
        email: 'user@example.com',
        contact: '9999999999',
        name: 'User Name',
      },
      theme: { color: '#F37254' },
    };

    const paymentResponse = await Razorpay.open(options);
    
    // 3. Verify payment
    if (paymentResponse.razorpay_payment_id) {
      const verification = await verifyPayment(
        paymentResponse.razorpay_payment_id,
        order.id,
        paymentResponse.razorpay_signature
      );
      return verification;
    } else {
      throw new Error('Payment failed or was cancelled');
    }
  } catch (error) {
    throw error;
  }
};

export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await axios.post(
      `${baseURL}/payments/verify-payment`,
      {
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};