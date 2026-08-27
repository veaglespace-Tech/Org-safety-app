const { io } = require('socket.io-client');

const SOCKET_SERVER_URL = 'http://localhost:5001'; // Assuming server is running on 5001
const testToken = 'SOS-TEST-TOKEN';

console.log('Testing live tracking socket server...');

// 1. Create the sender client (simulating the victim's device)
const sender = io(SOCKET_SERVER_URL);

sender.on('connect', () => {
  console.log('[Sender] Connected with ID:', sender.id);
  
  sender.emit('join-track', { token: testToken });
  console.log(`[Sender] Joined track: ${testToken}`);

  // Emit a mock location
  const mockLocation = {
    token: testToken,
    latitude: 19.0760,
    longitude: 72.8777,
    accuracy: 15,
    timestamp: Date.now()
  };
  
  sender.emit('location-updated', mockLocation);
  console.log('[Sender] Emitted location-updated:', mockLocation);
  
  // 2. Create a viewer client after a slight delay (simulating someone opening the dashboard)
  setTimeout(() => {
    console.log('\n--- Simulating Viewer Joining ---');
    const viewer = io(SOCKET_SERVER_URL);

    viewer.on('connect', () => {
      console.log('[Viewer] Connected with ID:', viewer.id);
      
      // Listen for the immediate location update (from cache)
      viewer.on('location-updated', (data) => {
        console.log('[Viewer] RECEIVED location-updated:', data);
        console.log('\n✅ TEST PASSED: Viewer successfully received the cached location!');
        
        // Cleanup
        sender.disconnect();
        viewer.disconnect();
        process.exit(0);
      });

      // Join the track (should trigger the cached location emit)
      viewer.emit('join-track', { token: testToken });
      console.log(`[Viewer] Joined track: ${testToken}, waiting for location...`);
      
      // Timeout just in case it fails
      setTimeout(() => {
        console.error('❌ TEST FAILED: Viewer did not receive location within 3 seconds.');
        sender.disconnect();
        viewer.disconnect();
        process.exit(1);
      }, 3000);
      
    });
  }, 1000);
});
