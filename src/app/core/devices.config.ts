// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
/** 设备配置 — 在此编辑你的设备列表 */
export const devicesConfig = {
  enabled: true,
  items: [
    {
      name: '示例设备',
      brand: 'Brand',
      model: 'Model',
      category: 'phone' as const,
      acquiredDate: '2026-01',
      description: '这是一台示例设备',
      icon: 'smartphone',
    },
  ] as Device[],
};

export interface Device {
  name: string;
  brand: string;
  model: string;
  category: 'phone' | 'laptop' | 'desktop' | 'tablet' | 'audio' | 'peripheral' | 'other';
  acquiredDate: string;
  description: string;
  icon?: string;
}
