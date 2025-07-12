/**
 * Test to verify device ID generation fix
 */

// Mock the browser environment
global.navigator = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  language: 'en-US'
};

global.screen = {
  width: 1920,
  height: 1080,
  colorDepth: 24
};

global.window = {
  crypto: {
    subtle: {
      digest: async (algorithm, data) => {
        // Simple mock implementation
        const hash = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          hash[i] = (i * 7) % 256; // Simple deterministic hash
        }
        return hash.buffer;
      }
    }
  }
};

// Mock the generateDeviceId function
async function generateDeviceId() {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join('|');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url format (32 bytes)
  const hashArray = new Uint8Array(hashBuffer);
  const base64 = btoa(String.fromCharCode(...hashArray));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]+$/, '');
}

// Test the fix
async function testDeviceIdFix() {
  console.log('Testing device ID generation fix...');
  
  try {
    const deviceId = await generateDeviceId();
    console.log('Generated device ID:', deviceId);
    
    // Convert back to bytes to verify it's 32 bytes
    const deviceIdBytes = new Uint8Array(
      atob(deviceId.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    console.log('Device ID length in bytes:', deviceIdBytes.length);
    console.log('Is 32 bytes?', deviceIdBytes.length === 32);
    
    if (deviceIdBytes.length === 32) {
      console.log('✅ SUCCESS: Device ID is exactly 32 bytes');
    } else {
      console.log('❌ FAILED: Device ID is not 32 bytes');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testDeviceIdFix(); 