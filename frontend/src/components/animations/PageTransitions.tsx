import React from 'react';
import { Box } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  transitionKey?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

// Staggered container animation
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.15
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

// Individual item animation variants
const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const fadeInDown = {
  hidden: { 
    opacity: 0, 
    y: -30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const fadeInLeft = {
  hidden: { 
    opacity: 0, 
    x: -30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    x: 30,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const fadeInRight = {
  hidden: { 
    opacity: 0, 
    x: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const fadeIn = {
  hidden: { 
    opacity: 0,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const getVariantByDirection = (direction: string) => {
  switch (direction) {
    case 'up': return fadeInUp;
    case 'down': return fadeInDown;
    case 'left': return fadeInLeft;
    case 'right': return fadeInRight;
    case 'fade': return fadeIn;
    default: return fadeInUp;
  }
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isVisible,
  transitionKey = 'page',
  delay = 0,
  direction = 'up'
}) => {
  const variant = getVariantByDirection(direction);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <MotionBox
          key={transitionKey}
          variants={variant}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            transitionDelay: `${delay}s`
          }}
        >
          {children}
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

// Staggered children container for complex layouts
export const StaggeredContainer: React.FC<{
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}> = ({ 
  children,
  isVisible,
  className
}) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <MotionBox
          className={className}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

// Individual staggered item component
export const StaggeredItem: React.FC<{
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}> = ({ 
  children,
  direction = 'up'
}) => {
  const variant = getVariantByDirection(direction);

  return (
    <MotionBox variants={variant}>
      {children}
    </MotionBox>
  );
};

// Wave entrance effect for dashboard sections
export const WaveEntrance: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({
  children,
  delay = 0
}) => {
  const waveVariant = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 20,
        delay: delay,
        duration: 0.6
      }
    }
  };

  return (
    <MotionBox
      variants={waveVariant}
      initial="hidden"
      animate="visible"
      style={{
        transformPerspective: 1000
      }}
    >
      {children}
    </MotionBox>
  );
};

// Floating animation for loading elements
export const FloatingAnimation: React.FC<{
  children: React.ReactNode;
  duration?: number;
  intensity?: number;
}> = ({
  children,
  duration = 3,
  intensity = 10
}) => {
  return (
    <MotionBox
      animate={{
        y: [0, -intensity, 0],
        rotate: [0, 1, -1, 0]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </MotionBox>
  );
};

export default PageTransition;
