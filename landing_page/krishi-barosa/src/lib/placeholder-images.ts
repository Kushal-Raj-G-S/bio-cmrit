// Utility to create SVG data URIs for placeholder images
export const createPlaceholderImage = (
  width: number,
  height: number,
  text: string,
  bgColor: string = '#22c55e',
  textColor: string = '#ffffff'
): string => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" 
            font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" 
            fill="${textColor}" font-weight="bold">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const placeholderImages = {
  userAvatar: (initials: string) => createPlaceholderImage(40, 40, initials),
  courseImage: (text: string) => createPlaceholderImage(300, 200, text),
  courseImageLarge: (text: string) => createPlaceholderImage(800, 450, text),
  instructorAvatar: (initials: string) => createPlaceholderImage(64, 64, initials),
  videoThumbnail: () => createPlaceholderImage(800, 450, 'Video Loading'),
  defaultCourse: () => createPlaceholderImage(300, 200, 'Course Image'),
};
