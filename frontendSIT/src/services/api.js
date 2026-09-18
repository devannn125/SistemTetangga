import { request } from './http'
export { API_BASE_URL, ApiError, request } from './http'
export * from './endpoints/citizens'
export * from './endpoints/houses'
export * from './endpoints/guests'
export * from './endpoints/finance'
export * from './endpoints/inventory'
export * from './endpoints/letters'
export * from './endpoints/regulations'
export * from './endpoints/organization'
export * from './endpoints/siskamling'
export * from './endpoints/announcements'
export * from './endpoints/statistics'
export * from './endpoints/audit'
// --- Landing CMS ---
export function getLandingData() {
  return request('/public/landing');
}

export function getAdminLandingProfile() {
  return request('/admin/landing/profile');
}

export function updateAdminLandingProfile(payload) {
  const isFormData = payload instanceof FormData;
  return request('/admin/landing/profile', {
    method: 'POST',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body: isFormData ? payload : JSON.stringify(payload)
  });
}

export function getAdminLandingArticles() {
  return request('/admin/landing/articles');
}

export function createAdminLandingArticle(formData) {
  // Pass FormData directly, without Content-Type so browser sets boundary
  return request('/admin/landing/articles', {
    method: 'POST',
    body: formData,
    headers: {} 
  });
}

export function updateAdminLandingArticle(id, formData) {
  return request(`/admin/landing/articles/${id}`, {
    method: 'POST', // Using POST for file uploads with method spoofing if needed, but I defined Route::post
    body: formData,
    headers: {}
  });
}

export function deleteAdminLandingArticle(id) {
  return request(`/admin/landing/articles/${id}`, {
    method: 'DELETE'
  });
}

export function getAdminLandingUmkm() {
  return request('/admin/landing/umkm');
}

export function createAdminLandingUmkm(formData) {
  return request('/admin/landing/umkm', {
    method: 'POST',
    body: formData,
    headers: {}
  });
}

export function updateAdminLandingUmkm(id, formData) {
  return request(`/admin/landing/umkm/${id}`, {
    method: 'POST',
    body: formData,
    headers: {}
  });
}

export function deleteAdminLandingUmkm(id) {
  return request(`/admin/landing/umkm/${id}`, {
    method: 'DELETE'
  });
}

export function impersonateUser(id) {
  return request(`/users/${id}/impersonate`, {
    method: 'POST'
  });
}
