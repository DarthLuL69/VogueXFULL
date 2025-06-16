export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  
  // Pusher configuration for real-time chat
  pusher: {
    key: 'your-actual-pusher-key', // Replace with your actual Pusher key
    cluster: 'eu',                 // Replace with your actual Pusher cluster
    forceTLS: true
  },
  
  // Payment configuration
  supportedPaymentMethods: ['visa', 'debit', 'apple_pay', 'paypal']
};