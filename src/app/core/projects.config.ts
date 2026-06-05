// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
/** 项目配置 — 在此编辑你的项目列表 */
export const projectsConfig = {
  enabled: true,
  items: [
    {
      name: 'Cyanth',
      description: '一个基于 Angular + AnalogJS 的 Material Design 3 博客',
      date: '2026-05',
      status: 'active' as const,
      techStack: ['Angular', 'AnalogJS', 'TypeScript', 'SCSS'],
      links: [{ label: 'GitHub', url: 'https://github.com/Celvra/Cyanth', icon: 'code' }],
    },
  ] as Project[],
};

export interface Project {
  name: string;
  description: string;
  date: string;
  status: 'active' | 'archived' | 'wip';
  techStack: string[];
  links: Array<{ label: string; url: string; icon: string }>;
}
