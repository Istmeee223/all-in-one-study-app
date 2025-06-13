export const CATEGORIES = {
  MATH: "math",
  PHYSICS: "physics", 
  CHEMISTRY: "chemistry",
  BIOLOGY: "biology",
  HISTORY: "history",
  LITERATURE: "literature",
  COMPUTER_SCIENCE: "computer-science",
  UNCATEGORIZED: "uncategorized",
} as const;

export const PRIORITY_LEVELS = {
  HIGH: "high",
  MEDIUM: "medium", 
  LOW: "low",
} as const;

export const FILE_TYPES = {
  DOCUMENTS: "documents",
  IMAGES: "images",
  ALL: "all",
  RECENT: "recent",
} as const;

export const STUDY_EVENT_TYPES = {
  STUDY: "study",
  EXAM: "exam",
  ASSIGNMENT: "assignment",
  REVIEW: "review",
} as const;

export const FLASHCARD_DIFFICULTIES = {
  EASY: 3,
  MEDIUM: 2,
  HARD: 1,
} as const;

export const POMODORO_DURATIONS = {
  FOCUS: 25,
  BREAK: 5,
  LONG_BREAK: 15,
} as const;

export const SEARCH_DEBOUNCE_MS = 300;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const getCategoryColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case CATEGORIES.MATH:
      return "category-math";
    case CATEGORIES.PHYSICS:
      return "category-physics";
    case CATEGORIES.CHEMISTRY:
      return "category-chemistry";
    default:
      return "category-uncategorized";
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case PRIORITY_LEVELS.HIGH:
      return "priority-high";
    case PRIORITY_LEVELS.MEDIUM:
      return "priority-medium";
    case PRIORITY_LEVELS.LOW:
      return "priority-low";
    default:
      return "priority-medium";
  }
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
};
