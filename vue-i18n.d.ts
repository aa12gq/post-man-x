declare module "vue-i18n" {
  export interface DefineLocaleMessage {
    home: {
      title: string;
      subtitle: string;
      getStarted: string;
      learnMore: string;
      features: {
        list: {
          grpcFirst: {
            title: string;
            desc: string;
          };
        };
      };
    };
    common: {
      save: string;
      cancel: string;
    };
  }
}
