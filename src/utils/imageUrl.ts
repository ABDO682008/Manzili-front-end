// Images come as paths like "uploads/services/mahashi3.jpg"
// Prepend API base URL: https://manzili-app.runasp.net/
export const getImageUrl = (filename: string | null | undefined): string => {
  if (!filename) return '/placeholder-service.jpg';
  if (filename.startsWith('http')) return filename;
  // Remove leading slash if present to avoid double slashes
  const cleanPath = filename.startsWith('/') ? filename.slice(1) : filename;
  return `https://manzili-app.runasp.net/${cleanPath}`;
};
