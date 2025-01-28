module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // A localidade dos arquivos
  ],
  theme: {
    extend: {
      colors: {
        'principal-blue': '#2386B9',
        'light-blue': '#70B4DC',
        'background-blue': '#DCE4E7',
        'text': '#000000',
        'icons-green': '#0F5800',
        'white-background': '#FFFFFF',
        'white-secundary': '#efefef',
        'blue-thirth': '#70B4DC',
        'green-button': '#2A881B',
        'green-border': '#97F131',
        'yellow-button': '#E8DA69',
        'yellow-border': '#B6A525',
        'keyword': '#E3681B',
        'purple': '#BB4FED', 
        'green': '#41CD51', 
        'yellow': '#FFCC00',
        'blue': '#00B4DD',
        'red': '#FF4949',
        'background': '#f5f5f5',
        'blue-test': '#dff0fe',
      },
      spacing: {                   // Configurações de espaçamento
        'screen-header': 'calc(100vh - 62px)', // Altura da tela menos o cabeçalho
        '272px': '17rem',
        '310px': '19.375rem',
        '350px': '22rem',
        '420px': '26.25rem',
        '464px': '29rem',
        '520px': '32.5rem',
        '530px': '33.125rem',
        '656px': '41rem',
        '718px': '44.875rem',
        '842px': '52.625rem',
        '920px': '57.5rem',
        '1248px': '78rem',
        '1440px': '90rem',
        '1664px': '104rem',
      },
      screens: {                  // Configurações de breakpoints
        vsm: '610px',
        '1.5xl': '1440px',
      },
      boxShadow: {               // Sombras personalizadas
        clean: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
        'very-clean': '1px 2px 6px 2px rgba(100, 100, 111, 0.2)',
        mid: '0px 2px 8px 0px rgba(99, 99, 99, 0.2)',
        hight:
          'rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px, rgba(17, 17, 26, 0.1) 0px 24px 80px',
        input:
          'rgba(0, 0, 0, 0.075) 0px 1px 3px, rgba(0, 0, 0, 0.144) 0px 1px 2px',
      },
      rotate: {                  // Configurações de rotação
        270: '270deg',
      },
      animation: {               // Adições novas de animação
        'dash-in': 'dash-in 0.6s linear forwards',
        'dash-out': 'dash-out 0.6s linear forwards',
      },
      keyframes: {              // Adições novas de keyframes
        'dash-in': {
          '0%': { strokeDashoffset: '240' },
          '100%': { strokeDashoffset: '0' },
        },
        'dash-out': {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '240' },
        },
      },
    },
  },
  plugins: [], // Não há plugins adicionais por enquanto
}