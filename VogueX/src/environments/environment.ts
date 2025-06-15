export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  
  // Pusher configuration for real-time chat
  pusherKey: 'your_pusher_key', // Replace with your actual Pusher key
  pusherCluster: 'mt1',
  
  // Payment configuration
  supportedPaymentMethods: ['visa', 'debit', 'apple_pay', 'paypal']
};