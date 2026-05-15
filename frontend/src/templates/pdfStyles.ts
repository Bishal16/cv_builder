export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

export const PDF_STYLES = {
  fontFamily: {
    CLASSIC: 'Helvetica, Arial, sans-serif',
    MODERN: 'Helvetica, Arial, sans-serif',
    ATS: 'Helvetica, Arial, sans-serif',
  },
  fontSize: {
    name: '26px',
    heading1: '24px',
    heading2: '18px',
    sectionTitle: '14px',
    body: '12px',
    small: '10px',
  },
  lineHeight: {
    body: '1.4',
    compact: '1.2',
  },
  padding: {
    header: '37px 45px 30px 45px',
    section: '30px',
    main: '30px',
  },
  colors: {
    CLASSIC: {
      name: '#1a202c',
      text: '#333333',
      muted: '#4a5568',
      border: '#cbd5e0',
      sidebarBg: '#f7fafc',
    },
    MODERN: {
      name: '#ffffff',
      text: '#1e293b',
      muted: '#64748b',
      primary: '#2563eb',
      accent: '#3b82f6',
    },
    ATS: {
      name: '#000000',
      text: '#000000',
      muted: '#333333',
      border: '#000000',
    },
  },
} as const;