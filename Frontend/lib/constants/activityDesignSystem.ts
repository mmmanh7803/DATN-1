/**
 * Design System cho các trang hoạt động học
 * Đồng bộ màu sắc, layout, typography cho tất cả activity pages
 */

// Màu sắc chủ đạo cho hero section
export const ACTIVITY_COLORS = {
  "vocabulary": {
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    primary: "blue",
    hover: "hover:bg-blue-600",
    border: "border-blue-500",
    text: "text-blue-600",
    bg: "bg-blue-50",
    icon: "📚",
  },
  "quick-memorize": {
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    primary: "purple",
    hover: "hover:bg-purple-600",
    border: "border-purple-500",
    text: "text-purple-600",
    bg: "bg-purple-50",
    icon: "⚡",
  },
  "flashcard": {
    gradient: "from-amber-500 via-orange-500 to-red-500",
    primary: "orange",
    hover: "hover:bg-orange-600",
    border: "border-orange-500",
    text: "text-orange-600",
    bg: "bg-orange-50",
    icon: "🃏",
  },
  "image-quiz": {
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    primary: "green",
    hover: "hover:bg-green-600",
    border: "border-green-500",
    text: "text-green-600",
    bg: "bg-green-50",
    icon: "🖼️",
  },
  "vocabulary-practice": {
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    primary: "blue",
    hover: "hover:bg-blue-600",
    border: "border-blue-500",
    text: "text-blue-600",
    bg: "bg-blue-50",
    icon: "✅",
  },
  "fill-blank": {
    gradient: "from-teal-500 via-emerald-500 to-green-500",
    primary: "teal",
    hover: "hover:bg-teal-600",
    border: "border-teal-500",
    text: "text-teal-600",
    bg: "bg-teal-50",
    icon: "✏️",
  },
  "pronunciation": {
    gradient: "from-pink-500 via-rose-500 to-red-500",
    primary: "pink",
    hover: "hover:bg-pink-600",
    border: "border-pink-500",
    text: "text-pink-600",
    bg: "bg-pink-50",
    icon: "🎤",
  },
  "grammar": {
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    primary: "indigo",
    hover: "hover:bg-indigo-600",
    border: "border-indigo-500",
    text: "text-indigo-600",
    bg: "bg-indigo-50",
    icon: "📖",
  },
  "progress": {
    gradient: "from-slate-500 via-gray-500 to-zinc-500",
    primary: "gray",
    hover: "hover:bg-gray-600",
    border: "border-gray-500",
    text: "text-gray-600",
    bg: "bg-gray-50",
    icon: "📊",
  },
} as const;

// Layout constants
export const LAYOUT = {
  hero: {
    padding: "py-12 md:py-16",
    titleSize: "text-4xl md:text-5xl",
    subtitleSize: "text-xl",
  },
  container: {
    padding: "px-4",
    maxWidth: "container mx-auto",
    gap: "gap-6",
  },
  grid: {
    main: "grid grid-cols-1 lg:grid-cols-3",
    sidebar: "lg:col-span-1",
    content: "lg:col-span-2",
  },
} as const;

// Typography
export const TYPOGRAPHY = {
  h1: "text-4xl md:text-5xl font-bold text-white mb-2",
  h2: "text-3xl md:text-4xl font-bold mb-4",
  h3: "text-2xl font-semibold mb-3",
  subtitle: "text-xl text-white/90",
  body: "text-gray-700",
  link: "text-white/80 hover:text-white transition",
} as const;

// Button styles
export const BUTTONS = {
  primary: "px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg",
  secondary: "px-4 py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors",
  back: "inline-flex items-center text-white/80 hover:text-white mb-4 transition",
  action: "px-4 py-2 rounded-lg font-medium transition-colors",
} as const;

// Activity titles mapping
export const ACTIVITY_TITLES: Record<string, string> = {
  "vocabulary": "Từ Vựng",
  "quick-memorize": "Nhớ Nhanh Từ",
  "flashcard": "Flash Card Từ Vựng",
  "image-quiz": "Kiểm Tra Từ Vựng Bằng Hình Ảnh",
  "vocabulary-practice": "Thực Hành Từ Vựng",
  "fill-blank": "Điền Từ Vào Chỗ Trống",
  "pronunciation": "Luyện Phát Âm",
  "grammar": "Ngữ Pháp",
  "progress": "Tiến Độ Học Tập",
};

// Get activity color config
export function getActivityColors(activityId: string) {
  return ACTIVITY_COLORS[activityId as keyof typeof ACTIVITY_COLORS] || ACTIVITY_COLORS.vocabulary;
}

// Get activity title
export function getActivityTitle(activityId: string): string {
  return ACTIVITY_TITLES[activityId] || activityId;
}

// Get activity icon
export function getActivityIcon(activityId: string): string {
  return getActivityColors(activityId).icon;
}
