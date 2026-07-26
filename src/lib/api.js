const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL is not set. Check your .env file.');
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (networkErr) {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError('Received an unexpected response from the server.', response.status);
    }
  }

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data;
}

export const api = {
  getListings: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/api/listings${params ? `?${params}` : ''}`);
  },

  getListing: (id) => request(`/api/listings/${id}`),

  login: (password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  createListing: (token, listing) =>
    request('/api/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(listing),
    }),

  updateListing: (token, id, updates) =>
    request(`/api/listings/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    }),

  deleteListing: (token, id, hard = false) =>
    request(`/api/listings/${id}${hard ? '?hard=true' : ''}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  addPhoto: (token, photo) =>
    request('/api/photos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(photo),
    }),

  deletePhoto: (token, id) =>
    request(`/api/photos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export { ApiError };

export async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new ApiError('Photo upload is not configured yet (missing Cloudinary settings).', 0);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new ApiError('Photo upload failed. Check your connection and try again.', 0);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data?.error?.message || 'Photo upload failed.', response.status);
  }

  return data.secure_url;
}
