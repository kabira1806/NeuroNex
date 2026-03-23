/**
 * API Connection Test Utility
 * Tests connectivity to the backend
 */

export async function testBackendConnection() {
  try {
    const response = await fetch("http://127.0.0.1:8000/test", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Backend Connected:", data);
      return { success: true, data };
    } else {
      console.error("❌ Backend Error:", response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error("❌ Backend Connection Failed:", error);
    return { success: false, error: error.message };
  }
}

export async function testDatabaseConnection() {
  try {
    // Try a simple endpoint that requires database access
    const response = await fetch("http://127.0.0.1:8000/api/users/1", {
      method: "GET",
    });
    
    console.log("Database test response:", response.status);
    return { success: response.ok, status: response.status };
  } catch (error) {
    console.error("Database test error:", error);
    return { success: false, error: error.message };
  }
}

export async function runAllTests() {
  console.log("🧪 Running API Connection Tests...");
  
  const backendTest = await testBackendConnection();
  console.log("Backend test:", backendTest);
  
  const dbTest = await testDatabaseConnection();
  console.log("Database test:", dbTest);
  
  return {
    backend: backendTest,
    database: dbTest,
    allPassed: backendTest.success && dbTest.success
  };
}
