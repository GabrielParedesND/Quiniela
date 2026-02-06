export interface Theme {
  name: string;
  description?: string;
  colors: {
    general: {
      background: string;
      backgroundSecondary: string;
      text: string;
      textSecondary: string;
    };
    components: {
      cards: {
        background: string;
        backgroundAlt: string;
        border: string;
      };
      buttons: {
        background: string;
        text: string;
        hover: string;
      };
      navbar: {
        background: string;
        text: string;
        accent: string;
      };
      inputs: {
        background: string;
        border: string;
        text: string;
      };
      tables: {
        header: string;
        row: string;
        rowAlt: string;
        border: string;
      };
    };
    states: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    accents: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
}
