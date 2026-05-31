export const SUPPORTED_CROPS = [
  { id: 'maize', label: 'Maize', emoji: '🌽' },
  { id: 'bean', label: 'Beans', emoji: '🫘' },
  { id: 'potato', label: 'Potatoes', emoji: '🥔' },
  { id: 'tomato', label: 'Tomatoes', emoji: '🍅' },
  { id: 'apple', label: 'Apple', emoji: '🍎' },
  { id: 'bellpepper', label: 'Bell Pepper', emoji: '🫑' },
  { id: 'cassava', label: 'Cassava', emoji: '🍠' },
  { id: 'cherry', label: 'Cherry', emoji: '🍒' },
  { id: 'grape', label: 'Grape', emoji: '🍇' },
  { id: 'peach', label: 'Peach', emoji: '🍑' },
  { id: 'strawberry', label: 'Strawberry', emoji: '🍓' },
];

export const OTHER_CROPS = [
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'tea', label: 'Tea', emoji: '🍵' },
  { id: 'other', label: 'Other', emoji: '🌱' },
];

export const ALL_CROPS = [...SUPPORTED_CROPS, ...OTHER_CROPS];

export const getCropLabel = (id: string) => {
  const crop = ALL_CROPS.find(c => c.id === id.toLowerCase());
  return crop ? crop.label : id;
};

export const normalizeCropForApi = (label: string): string => {
  const lowerLabel = label.toLowerCase();
  
  // Direct matches first
  const directMatch = SUPPORTED_CROPS.find(c => c.id === lowerLabel || c.label.toLowerCase() === lowerLabel);
  if (directMatch) return directMatch.id;

  // Handle common plurals/variations
  if (lowerLabel === 'tomatoes') return 'tomato';
  if (lowerLabel === 'potatoes') return 'potato';
  if (lowerLabel === 'beans') return 'bean';
  if (lowerLabel === 'bell pepper') return 'bellpepper';

  return lowerLabel;
};
