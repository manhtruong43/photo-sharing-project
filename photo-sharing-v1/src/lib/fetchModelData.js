import models from "../modelData/models";

/**
 * Helper function to match URL and return mock data in a static client environment
 */
function getMockData(url) {
  if (url === "/test/info") {
    return models.schemaInfo();
  }
  if (url === "/user/list") {
    return models.userListModel();
  }
  if (url.startsWith("/user/")) {
    const id = url.substring("/user/".length);
    return models.userModel(id);
  }
  if (url.startsWith("/photosOfUser/")) {
    const id = url.substring("/photosOfUser/".length);
    return models.photoOfUserModel(id);
  }
  return null;
}

/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns {Promise} Resolves to { data: responseJSON } or rejects with { status, statusText }
 */
function fetchModel(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ data });
          return;
        } catch (e) {
          reject({
            status: 200,
            statusText: "Invalid JSON response from server"
          });
          return;
        }
      }
      
      // If we got an actual HTTP error status (400, 404, 500, etc.), reject immediately
      if (xhr.status > 0) {
        reject({
          status: xhr.status,
          statusText: xhr.responseText || xhr.statusText || "Server error",
        });
        return;
      }
      
      // Fallback for static development environment when server is unreachable
      const mockData = getMockData(url);
      if (mockData !== null) {
        resolve({ data: mockData });
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText || "Fetch model error",
        });
      }
    };
    
    xhr.onerror = () => {
      const mockData = getMockData(url);
      if (mockData !== null) {
        resolve({ data: mockData });
      } else {
        reject({
          status: 0,
          statusText: "Network Error",
        });
      }
    };
    
    xhr.send();
  });
}

export default fetchModel;

