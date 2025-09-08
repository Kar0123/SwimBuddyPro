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
    // Tropical turquoise for playful accents
    turquoise: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    // Sea foam for gentle highlights
    seafoam: {
      50: '#f0fdf9',
      100: '#e6fffa',
      200: '#b2f5ea',
      300: '#81e6d9',
      400: '#4fd1c7',
      500: '#38b2ac',
      600: '#319795',
      700: '#2c7a7b',
      800: '#285e61',
      900: '#234e52',
    },
    // Tropical blue for vibrant elements
    tropical: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    // Deep sea for darker elements
    deepsea: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
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
    heading: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    body: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
    playful: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    aquatic: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
  // Consistent corner radii across components
  radii: {
    none: '0',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '28px',
    full: '9999px',
  },
  
  layerStyles: {
    glass: {
      bg: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(14px) saturate(120%)',
      WebkitBackdropFilter: 'blur(14px) saturate(120%)',
      border: '1px solid',
      borderColor: 'rgba(255,255,255,0.45)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      borderRadius: 'xl',
      position: 'relative',
      _before: {
        content: '""',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        bgGradient: 'linear(to-br, whiteAlpha.200, transparent)',
        borderRadius: 'inherit',
      },
    },
    glassDark: {
      bg: 'rgba(15,23,42,0.55)',
      backdropFilter: 'blur(16px) saturate(120%)',
      WebkitBackdropFilter: 'blur(16px) saturate(120%)',
      border: '1px solid',
      borderColor: 'rgba(255,255,255,0.12)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
      borderRadius: 'xl',
      position: 'relative',
      _before: {
        content: '""',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        bgGradient: 'linear(to-br, whiteAlpha.200, transparent)',
        borderRadius: 'inherit',
      },
    },
    glassSubtle: {
      bg: 'rgba(255,255,255,0.35)',
      backdropFilter: 'blur(8px) saturate(110%)',
      WebkitBackdropFilter: 'blur(8px) saturate(110%)',
      border: '1px solid',
      borderColor: 'rgba(255,255,255,0.25)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      borderRadius: 'lg',
      position: 'relative',
    },
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
        glass: {
          container: {
            bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)',
            backdropFilter: 'blur(32px) saturate(180%)',
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.25)',
            borderRadius: 'xl',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            _before: {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              bgGradient: 'linear(to-r, transparent, rgba(255, 255, 255, 0.6), transparent)',
            },
            _after: {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgGradient: 'radial(circle at 50% 0%, rgba(255, 255, 255, 0.1), transparent 70%)',
              pointerEvents: 'none',
            },
            _hover: {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
        'glass-dark': {
          container: {
            bg: 'linear-gradient(135deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.1) 100%)',
            backdropFilter: 'blur(24px) saturate(150%)',
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 'xl',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            _hover: {
              transform: 'translateY(-4px)',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            },
          },
        },
      },
    },
    // Playful heading styles with water-themed fonts
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        fontWeight: '700',
        lineHeight: '1.2',
        color: 'turquoise.600',
      },
      sizes: {
        xs: {
          fontSize: 'md',
          fontWeight: '600',
        },
        sm: {
          fontSize: 'lg',
          fontWeight: '600',
        },
        md: {
          fontSize: 'xl',
          fontWeight: '700',
        },
        lg: {
          fontSize: '2xl',
          fontWeight: '700',
        },
        xl: {
          fontSize: '3xl',
          fontWeight: '800',
        },
        '2xl': {
          fontSize: '4xl',
          fontWeight: '800',
        },
      },
      variants: {
        playful: {
          fontFamily: 'heading',
          color: 'tropical.500',
          fontWeight: '700',
          letterSpacing: '-0.025em',
        },
        aquatic: {
          fontFamily: 'heading',
          bgGradient: 'linear(to-r, turquoise.400, tropical.500)',
          bgClip: 'text',
          fontWeight: '700',
          letterSpacing: '-0.025em',
        },
        ocean: {
          color: 'ocean.600',
          fontFamily: 'heading',
          fontWeight: '600',
          letterSpacing: '-0.02em',
        },
      },
    },
    Button: {
      baseStyle: {
  borderRadius: 'lg',
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
        glass: {
          bg: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.6)',
          backdropFilter: 'blur(10px)',
          color: 'gray.800',
          _hover: {
            bg: 'rgba(255,255,255,0.6)',
            transform: 'translateY(-2px)',
          },
          _active: { transform: 'translateY(0)' },
        },
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
        turquoise: {
          bg: 'linear-gradient(135deg, turquoise.400, turquoise.600)',
          color: 'white',
          fontFamily: 'heading',
          fontWeight: '600',
          letterSpacing: '0.025em',
          _hover: {
            bg: 'linear-gradient(135deg, turquoise.500, turquoise.700)',
            boxShadow: '0 8px 25px rgba(20, 184, 166, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        tropical: {
          bg: 'linear-gradient(135deg, tropical.400, seafoam.500)',
          color: 'white',
          fontFamily: 'heading',
          fontWeight: '600',
          letterSpacing: '0.025em',
          _hover: {
            bg: 'linear-gradient(135deg, tropical.500, seafoam.600)',
            boxShadow: '0 8px 25px rgba(34, 211, 238, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        coral: {
          bg: 'linear-gradient(135deg, coral.400, coral.600)',
          color: 'white',
          fontFamily: 'heading',
          fontWeight: '600',
          letterSpacing: '0.025em',
          _hover: {
            bg: 'linear-gradient(135deg, coral.500, coral.700)',
            boxShadow: '0 8px 25px rgba(251, 146, 60, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // Enhanced Input component with focus animations
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md',
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
        glass: {
          field: {
            bg: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
            borderColor: 'whiteAlpha.500',
            _hover: { borderColor: 'whiteAlpha.700' },
            _focus: {
              borderColor: 'aqua.500',
              boxShadow: '0 0 0 3px rgba(0, 188, 212, 0.2)',
              bg: 'rgba(255,255,255,0.7)'
            },
          },
        },
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
          borderRadius: 'lg',
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
          transition: 'color 0.3s ease, transform 0.45s cubic-bezier(0.2,0.8,0.2,1)',
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
  borderRadius: 'sm',
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
        glass: {
          bg: 'rgba(255,255,255,0.4)',
          color: 'gray.800',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.65)',
        },
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
      // Reduced motion handling and helper selector for single entrance animations
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animation: 'none !important',
          transition: 'none !important',
        },
      },
      // Annotate elements with data-animated="entrance" to get a single entrance animation
      '[data-animated="entrance"]': {
        animation: 'entrance 0.9s cubic-bezier(0.2,0.8,0.2,1) 1',
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
    ,
    entrance: {
      '0%': { opacity: 0, transform: 'scale(0.98) translateY(6px)' },
      '60%': { opacity: 1, transform: 'scale(1.02) translateY(-2px)' },
      '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
    }
  },
  animation: {
    wave: 'wave 2s ease-in-out infinite',
    pulse: 'pulse 2s infinite',
    float: 'float 3s ease-in-out infinite',
    ripple: 'ripple 0.6s ease-out'
    ,
    entrance: 'entrance 0.9s cubic-bezier(0.2,0.8,0.2,1) 1'
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
