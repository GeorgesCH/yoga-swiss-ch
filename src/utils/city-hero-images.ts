// City-based hero images utility for YogaSwiss portal pages
export const cityHeroImages = {
  'zurich': 'https://images.unsplash.com/photo-1551014878-7dea70f2ff37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxadXJpY2glMjBTd2l0emVybGFuZCUyMGNpdHklMjBza3lsaW5lJTIwbW91bnRhaW5zfGVufDF8fHx8MTc1Njk4MzA1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'bern': 'https://images.unsplash.com/photo-1655286392673-3c7a545ed304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZXJuJTIwU3dpdHplcmxhbmQlMjBjaXR5JTIwb2xkJTIwdG93biUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NTY5ODMwNTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'geneva': 'https://images.unsplash.com/photo-1695931547941-bbfb82a1b9cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHZW5ldmElMjBTd2l0emVybGFuZCUyMGxha2UlMjBtb3VudGFpbnMlMjBjaXR5fGVufDF8fHx8MTc1Njk4MzA2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'basel': 'https://images.unsplash.com/photo-1661689117312-045b36273c8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYXNlbCUyMFN3aXR6ZXJsYW5kJTIwUmhpbmUlMjByaXZlciUyMGNpdHl8ZW58MXx8fHwxNzU2OTgzMDY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'lausanne': 'https://images.unsplash.com/photo-1701152897283-76de474749d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMYXVzYW5uZSUyMFN3aXR6ZXJsYW5kJTIwbGFrZSUyMEdlbmV2YSUyMG1vdW50YWluc3xlbnwxfHx8fDE3NTY5ODMwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'lucerne': 'https://images.unsplash.com/photo-1589351005597-353cec517249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMdWNlcm5lJTIwU3dpdHplcmxhbmQlMjBtb3VudGFpbnMlMjBsYWtlJTIwY2l0eXxlbnwxfHx8fDE3NTY5ODMwNzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
};

/**
 * Get city-specific hero image based on location name
 * @param locationName - Name of the city (case insensitive)
 * @returns URL of the city hero image, defaults to Zurich if not found
 */
export const getCityHeroImage = (locationName?: string): string => {
  if (!locationName) return cityHeroImages.zurich;
  
  const cityKey = locationName.toLowerCase().trim();
  return cityHeroImages[cityKey as keyof typeof cityHeroImages] || cityHeroImages.zurich;
};

/**
 * Get alt text for city hero image
 * @param locationName - Name of the city
 * @returns Alt text for the image
 */
export const getCityHeroImageAlt = (locationName?: string): string => {
  const cityName = locationName || 'Zurich';
  return `${cityName} city view - Swiss Alps yoga destination`;
};

/**
 * Available city keys for hero images
 */
export const availableCities = Object.keys(cityHeroImages);

/**
 * Check if a city has a custom hero image
 * @param locationName - Name of the city to check
 * @returns Boolean indicating if city has custom image
 */
export const hasCityHeroImage = (locationName?: string): boolean => {
  if (!locationName) return false;
  const cityKey = locationName.toLowerCase().trim();
  return cityKey in cityHeroImages;
};