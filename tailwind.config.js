module.exports = {
    mode: 'jit',
    purge: [
        './pages/**/*.tsx',
        './components/**/*.tsx',
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#00bcd4',
                'secondary': '#ff9800',
                'tertiary': '#ff5722',
                'quaternary': '#9c27b0',
            },
            fontFamily: {
                'sans': [
                    'Roboto',
                    'Graphik',
                    'sans-serif',
                ]
            },
            spacing: {
                '128': '32rem',
                '144': '36rem'
            },
            borderRadius: {
                '4xl': '2rem'
            }
        }
    },
    variants: {},
    plugins: []   
}