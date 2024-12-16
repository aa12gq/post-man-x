export interface LayoutPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  preview: {
    sidebar?: {
      position: 'left' | 'right';
      width: number;
    };
    header?: {
      height: number;
    };
    tabs?: {
      position: 'top' | 'left' | 'bottom';
    };
    toolbar?: {
      position: 'top' | 'bottom';
    };
  };
}

export const layoutPresets: LayoutPreset[] = [
  {
    id: 'classic',
    name: '经典布局',
    icon: 'Layout',
    description: '顶部工具栏 + 左侧边栏',
    preview: {
      header: { height: 48 },
      sidebar: { position: 'left', width: 240 },
      tabs: { position: 'top' },
      toolbar: { position: 'top' },
    },
  },
  {
    id: 'modern',
    name: '现代布局',
    icon: 'Grid',
    description: '顶部工具栏 + 双侧边栏',
    preview: {
      header: { height: 48 },
      sidebar: { position: 'left', width: 200 },
      tabs: { position: 'left' },
      toolbar: { position: 'top' },
    },
  },
  {
    id: 'compact',
    name: '紧凑布局',
    icon: 'Fold',
    description: '隐藏式侧边栏 + 底部工具栏',
    preview: {
      header: { height: 40 },
      sidebar: { position: 'left', width: 180 },
      tabs: { position: 'top' },
      toolbar: { position: 'bottom' },
    },
  },
  {
    id: 'minimal',
    name: '简约布局',
    icon: 'Monitor',
    description: '无侧边栏 + 顶部导航',
    preview: {
      header: { height: 56 },
      tabs: { position: 'top' },
      toolbar: { position: 'top' },
    },
  },
]; 