import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// Enhanced swimming theme with aquatic design elements
export const swimmingTheme = extendTheme({
  config,
  colors: {
    primary: {
      50: '#e6f7ff',
      100: '#bae7ff',
      200: '#91d5ff', 
      300: '#69c0ff',
      400: '#40a9ff',
      500: '#1890ff',
      600: '#096dd9',
      700: '#0050b3',
      800: '#003a8c',
      900: '#002766',
    },
    aqua: {
      50: '#e0f7fa',
      100: '#b2ebf2',
      200: '#80deea',
      300: '#4dd0e1',
      400: '#26c6da',
      500: '#00bcd4',
      600: '#00acc1',
      700: '#0097a7',
      800: '#00838f',
      900: '#006064',
    },
    ocean: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    wave: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    coral: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    // Modern success/improvement color
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    // Modern warning/attention color
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Modern neutral grays
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },
  fonts: {
    heading: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    body: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            bgGradient: 'linear(to-r, primary.400, aqua.400, ocean.400)',
            borderTopRadius: '20px',
          },
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
      variants: {
        swimming: {
          container: {
            bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.95) 100%)',
            borderColor: 'rgba(0, 188, 212, 0.2)',
            _before: {
              bgGradient: 'linear(to-r, aqua.400, primary.400)',
            },
          },
        },
        performance: {
          container: {
            bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(227, 242, 253, 0.95) 100%)',
            borderColor: 'rgba(33, 150, 243, 0.2)',
            _before: {
              bgGradient: 'linear(to-r, ocean.400, primary.500)',
            },
          },
        },
        celebration: {
          container: {
            bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 237, 0.95) 100%)',
            borderColor: 'rgba(249, 115, 22, 0.2)',
            _before: {
              bgGradient: 'linear(to-r, coral.400, primary.400)',
            },
          },
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: '16px',
        fontWeight: '600',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        _before: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          transition: 'left 0.5s ease',
        },
        _hover: {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          _before: {
            left: '100%',
          },
        },
        _active: {
          transform: 'translateY(0px)',
          transition: 'transform 0.1s ease',
        },
      },
      variants: {
        solid: {
          bg: 'linear-gradient(135deg, primary.500, primary.600)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, primary.600, primary.700)',
            _disabled: {
              bg: 'linear-gradient(135deg, gray.300, gray.400)',
            },
          },
        },
        swimming: {
          bg: 'linear-gradient(135deg, aqua.500, primary.500)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, aqua.600, primary.600)',
            boxShadow: '0 8px 25px rgba(0, 188, 212, 0.4)',
          },
        },
        wave: {
          bg: 'linear-gradient(135deg, wave.500, ocean.500)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, wave.600, ocean.600)',
            boxShadow: '0 8px 25px rgba(14, 165, 233, 0.4)',
          },
        },
      },
    },
    // Enhanced Input component with focus animations
    Input: {
      baseStyle: {
        field: {
          borderRadius: '12px',
          borderWidth: '2px',
          borderColor: 'gray.200',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          _focus: {
            borderColor: 'aqua.500',
            boxShadow: '0 0 0 3px rgba(0, 188, 212, 0.1)',
            transform: 'translateY(-1px)',
          },
          _hover: {
            borderColor: 'gray.300',
          },
          _invalid: {
            borderColor: 'red.500',
            boxShadow: '0 0 0 3px rgba(245, 101, 101, 0.1)',
          },
        },
      },
      variants: {
        swimming: {
          field: {
            bg: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderColor: 'aqua.200',
            _focus: {
              borderColor: 'aqua.500',
              boxShadow: '0 0 0 3px rgba(0, 188, 212, 0.2)',
              bg: 'rgba(255, 255, 255, 0.95)',
            },
          },
        },
      },
    },
    // Enhanced Stats component with hover animations
    Stat: {
      baseStyle: {
        container: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '16px',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgGradient: 'linear(to-r, primary.400, aqua.400)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
            _before: {
              opacity: 1,
            },
          },
        },
        number: {
          fontWeight: '800',
          fontSize: '2xl',
          color: 'primary.600',
          transition: 'color 0.3s ease',
        },
        label: {
          color: 'gray.600',
          fontWeight: '600',
          fontSize: 'sm',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        helpText: {
          color: 'gray.500',
          fontSize: 'xs',
        },
      },
      variants: {
        swimming: {
          container: {
            bg: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            _before: {
              bgGradient: 'linear(to-r, aqua.400, ocean.400, wave.400)',
            },
          },
          number: {
            color: 'aqua.600',
          },
        },
      },
    },
    // Enhanced Progress component
    Progress: {
      baseStyle: {
        track: {
          borderRadius: '10px',
          bg: 'gray.100',
          overflow: 'hidden',
        },
        filledTrack: {
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            animation: 'wave 2s ease-in-out infinite',
          },
        },
      },
      variants: {
        swimming: {
          track: {
            bg: 'rgba(0, 188, 212, 0.1)',
          },
          filledTrack: {
            bgGradient: 'linear(to-r, aqua.400, primary.400)',
          },
        },
      },
    },
    // Enhanced Badge component with animations
    Badge: {
      baseStyle: {
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: 'xs',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        _hover: {
          transform: 'scale(1.05)',
        },
      },
      variants: {
        swimming: {
          bg: 'aqua.500',
          color: 'white',
          _hover: {
            bg: 'aqua.600',
            boxShadow: '0 4px 12px rgba(0, 188, 212, 0.4)',
          },
        },
        wave: {
          bg: 'wave.500',
          color: 'white',
          _hover: {
            bg: 'wave.600',
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
          },
        },
        success: {
          bg: 'success.500',
          color: 'white',
          _hover: {
            bg: 'success.600',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
          },
        },
      },
    },
    Table: {
      variants: {
        swimming: {
          table: {
            bg: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
          thead: {
            bg: 'linear-gradient(135deg, primary.50, aqua.50)',
          },
          th: {
            borderColor: 'primary.100',
            fontWeight: '700',
            color: 'primary.700',
            textTransform: 'uppercase',
            fontSize: 'xs',
            letterSpacing: '0.05em',
          },
          td: {
            borderColor: 'gray.100',
          },
          tbody: {
            tr: {
              _hover: {
                bg: 'linear-gradient(135deg, primary.25, aqua.25)',
                transform: 'scale(1.001)',
                transition: 'all 0.2s ease',
              },
            },
          },
        },
      },
    },
  },
  // Enhanced spacing system for better layout consistency
  space: {
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    18: '4.5rem',     // 72px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px - Minimum touch target
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },
  // Enhanced shadows for depth and hierarchy
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    md: '0 6px 16px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 12px 24px -4px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 32px -8px rgba(0, 0, 0, 0.2)',
    '2xl': '0 32px 64px -12px rgba(0, 0, 0, 0.25)',
    aqua: '0 8px 25px rgba(0, 188, 212, 0.4)',
    ocean: '0 8px 25px rgba(33, 150, 243, 0.4)',
    wave: '0 8px 25px rgba(14, 165, 233, 0.4)',
    glow: '0 0 20px rgba(24, 144, 255, 0.5)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  // Focus management for accessibility
  semanticTokens: {
    colors: {
      focusRing: {
        default: 'aqua.500',
        _dark: 'aqua.400',
      },
      focusRingShadow: {
        default: '0 0 0 3px rgba(0, 188, 212, 0.3)',
        _dark: '0 0 0 3px rgba(77, 208, 225, 0.3)',
      },
    },
  },
  // Global focus styles for accessibility
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #e3f2fd 0%, #f0f9ff 50%, #e0f7fa 100%)',
        color: 'gray.800',
        minHeight: '100vh',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(0, 188, 212, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(0, 172, 193, 0.08) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: -1,
        }
      },
      '*': {
        scrollBehavior: 'smooth',
      },
      // Enhanced focus styles for accessibility
      '*:focus-visible': {
        outline: 'none',
        boxShadow: 'focusRingShadow',
        borderColor: 'focusRing',
      },
      // Remove focus styles for mouse users
      '*:focus:not(:focus-visible)': {
        outline: 'none',
        boxShadow: 'none',
      },
    },
  },
  // Animation keyframes for wave effects
  keyframes: {
    wave: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' }
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 }
    },
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' }
    },
    ripple: {
      '0%': {
        transform: 'scale(0)',
        opacity: 1
      },
      '100%': {
        transform: 'scale(4)',
        opacity: 0
      }
    }
  },
  animation: {
    wave: 'wave 2s ease-in-out infinite',
    pulse: 'pulse 2s infinite',
    float: 'float 3s ease-in-out infinite',
    ripple: 'ripple 0.6s ease-out'
  },
  breakpoints: {
    base: '0px',
    sm: '480px',
    md: '768px',
    lg: '992px',
    xl: '1280px',
    '2xl': '1536px',
  },
})
