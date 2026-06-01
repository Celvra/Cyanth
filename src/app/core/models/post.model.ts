// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
export interface PostFrontmatter {
  title: string;
  published: string;
  description?: string;
  tags: string[];
  category?: string;
  draft: boolean;
  cover?: string;
  type: 'post' | 'share';
  appIcon?: string;
  screenshots?: string[];
  platforms?: string[];
  version?: string;
  downloadLink?: string;
  detailLink?: string;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  excerpt?: string;
  readingTime?: string;
}

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}
