export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: '700';
    };
    h2: {
      fontSize: number;
      fontWeight: '600';
    };
    h3: {
      fontSize: number;
      fontWeight: '600';
    };
    body: {
      fontSize: number;
      fontWeight: '400';
    };
    caption: {
      fontSize: number;
      fontWeight: '400';
    };
  };
}

export type ThemeMode = 'light' | 'dark';
