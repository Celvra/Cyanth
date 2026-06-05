// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable, signal } from '@angular/core';

interface SearchablePost {
  slug: string;
  frontmatter: { title: string; description?: string; category?: string; tags: string[] };
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private posts = signal<SearchablePost[]>([]);
  private query = signal('');

  readonly allPosts = this.posts.asReadonly();
  readonly searchQuery = this.query.asReadonly();

  setPosts(posts: SearchablePost[]): void {
    this.posts.set(posts);
  }

  setQuery(q: string): void {
    this.query.set(q);
  }

  get filteredPosts(): SearchablePost[] {
    const q = this.query().toLowerCase();
    if (!q) {
      return this.posts();
    }
    return this.posts().filter(
      p =>
        p.frontmatter.title.toLowerCase().includes(q) ||
        (p.frontmatter.description ?? '').toLowerCase().includes(q) ||
        (p.frontmatter.category?.toLowerCase().includes(q) ?? false) ||
        p.frontmatter.tags.some(t => t.toLowerCase().includes(q)),
    );
  }
}
