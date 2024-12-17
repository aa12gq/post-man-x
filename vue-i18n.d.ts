declare module 'vue-i18n' {
  export interface DefineLocaleMessage {
    home: {
      title: string
      subtitle: string
      getStarted: string
      learnMore: string
      features: {
        list: {
          grpcFirst: {
            title: string
            desc: string
          }
          // ... 其他翻译键的类型定义
        }
      }
    }
    common: {
      save: string
      cancel: string
      // ... 其他翻译键的类型定义
    }
    // ... 其他命名空间的类型定义
  }
} 