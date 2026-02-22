export interface UserProfile {
    id: number;
    username: string;
    display_name: string;
    avatar_emoji: string;
    bio: string;
    current_level: number;
    total_xp: number;
    longest_streak: number;
    current_streak: number;
    journey_title: string;
    github_url: string;
    linkedin_url: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    profile: UserProfile;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    is_completed: boolean;
    difficulty: 'easy' | 'medium' | 'hard' | 'boss';
    xp_value: number;
    completed_at: string | null;
}

export interface KnowledgeCheck {
    id: number;
    question: string;
    is_answered: boolean;
    answer_notes: string;
}

export interface JourneyDay {
    id: number;
    day_number: number;
    week: number;
    date: string;
    title: string;
    status: 'upcoming' | 'active' | 'completed' | 'pre_completed' | 'post_completed' | 'missed';
    xp_reward: number;
    xp_earned: number;
    tasks: Task[];
    knowledge_checks: KnowledgeCheck[];
    blog_slug?: string;
    notes: string;
}

export interface DailyXP {
    date: string;
    day_name: string;
    xp: number;
}

export interface JourneyStats {
    total_xp: number;
    level: number;
    xp_in_current: number;
    xp_needed: number;
    streak: number;
    days_completed: number;
    total_days: number;
    percent_complete: number;
    daily_xp: DailyXP[];
}

export interface ExternalLink {
    title: string;
    url: string;
}

export interface BlogEntry {
    id: number;
    slug: string;
    title: string;
    content: string;
    status: 'draft' | 'published';
    mood: string;
    tags: string[];
    views: number;
    published_at: string | null;
    updated_at: string;
    day?: number | null;
    github_url?: string;
    external_links?: ExternalLink[];
}
