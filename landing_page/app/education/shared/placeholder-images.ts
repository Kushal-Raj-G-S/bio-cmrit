// Placeholder image utilities
export const placeholderImages = {
  userAvatar: (initials: string) => 
    `https://via.placeholder.com/100x100/22c55e/ffffff?text=${encodeURIComponent(initials)}`,
  
  courseImage: (title: string) =>
    `https://via.placeholder.com/400x300/22c55e/ffffff?text=${encodeURIComponent(title.slice(0, 10))}`,
  
  videoThumbnail: () =>
    'https://via.placeholder.com/800x450/22c55e/ffffff?text=Video+Thumbnail'
}

export default placeholderImages
