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
    }
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
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
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
            borderTopRadius: '16px',
          },
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
          },
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
        borderRadius: '12px',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        _before: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          transition: 'left 0.5s ease',
        },
        _hover: {
          transform: 'translateY(-1px)',
          _before: {
            left: '100%',
          },
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
      variants: {
        swimming: {
          bg: 'linear-gradient(135deg, aqua.500, primary.500)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, aqua.600, primary.600)',
            boxShadow: '0 4px 20px rgba(0, 188, 212, 0.4)',
          },
        },
        wave: {
          bg: 'linear-gradient(135deg, wave.500, ocean.500)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, wave.600, ocean.600)',
            boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)',
          },
        },
      },
    },
    Badge: {
      variants: {
        swimming: {
          bg: 'linear-gradient(135deg, aqua.100, primary.100)',
          color: 'primary.700',
          borderWidth: '1px',
          borderColor: 'primary.200',
          borderRadius: '8px',
          px: 2,
          py: 1,
        },
        wave: {
          bg: 'linear-gradient(135deg, wave.100, ocean.100)',
          color: 'ocean.700',
          borderWidth: '1px',
          borderColor: 'ocean.200',
          borderRadius: '8px',
          px: 2,
          py: 1,
        },
        celebration: {
          bg: 'linear-gradient(135deg, coral.100, coral.200)',
          color: 'coral.700',
          borderWidth: '1px',
          borderColor: 'coral.300',
          borderRadius: '8px',
          px: 2,
          py: 1,
          animation: 'pulse 2s infinite',
        },
      },
    },
    Progress: {
      baseStyle: {
        track: {
          borderRadius: '12px',
          bg: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid',
          borderColor: 'rgba(0, 188, 212, 0.1)',
        },
        filledTrack: {
          borderRadius: '12px',
          bgGradient: 'linear(to-r, aqua.400, primary.500)',
          position: 'relative',
          _after: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgGradient: 'linear(to-r, transparent, rgba(255, 255, 255, 0.3), transparent)',
            animation: 'wave 2s ease-in-out infinite',
            borderRadius: '12px',
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
    Stat: {
      baseStyle: {
        container: {
          bg: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          p: 4,
          border: '1px solid',
          borderColor: 'rgba(0, 188, 212, 0.1)',
          position: 'relative',
          _before: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            bgGradient: 'linear(to-r, aqua.400, primary.400)',
            borderTopRadius: '12px',
          },
        },
        number: {
          color: 'primary.600',
          fontWeight: '800',
        },
        label: {
          color: 'gray.600',
          fontWeight: '600',
          fontSize: 'sm',
        },
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
