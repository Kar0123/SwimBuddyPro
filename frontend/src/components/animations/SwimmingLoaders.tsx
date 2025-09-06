import React from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

// Swimming-themed loading animations
const swimAnimation = `
  @keyframes swimAcross {
    0% { transform: translateX(-50px) scaleX(1); }
    25% { transform: translateX(25px) scaleX(1.1); }
    50% { transform: translateX(100px) scaleX(1); }
    75% { transform: translateX(25px) scaleX(0.9); }
    100% { transform: translateX(-50px) scaleX(1); }
  }
`;

const bubbleAnimation = `
  @keyframes bubbleUp {
    0% { 
      transform: translateY(20px) scale(0.8); 
      opacity: 0.7; 
    }
    50% { 
      transform: translateY(-10px) scale(1.2); 
      opacity: 1; 
    }
    100% { 
      transform: translateY(-40px) scale(0.6); 
      opacity: 0; 
    }
  }
`;

const waveRippleAnimation = `
  @keyframes waveRipple {
    0% { 
      transform: scale(0.8); 
      opacity: 1; 
      border-radius: 50%; 
    }
    50% { 
      transform: scale(1.2); 
      opacity: 0.5; 
      border-radius: 40%; 
    }
    100% { 
      transform: scale(1.6); 
      opacity: 0; 
      border-radius: 30%; 
    }
  }
`;

const strokeAnimation = `
  @keyframes swimStroke {
    0% { transform: rotate(0deg) scaleY(1); }
    25% { transform: rotate(90deg) scaleY(1.2); }
    50% { transform: rotate(180deg) scaleY(1); }
    75% { transform: rotate(270deg) scaleY(0.8); }
    100% { transform: rotate(360deg) scaleY(1); }
  }
`;

// Inject CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = swimAnimation + bubbleAnimation + waveRippleAnimation + strokeAnimation;
  document.head.appendChild(style);
}

// Swimming Fish Loader
const SwimmingFishLoader: React.FC<{
  size?: string;
  color?: string;
}> = ({ 
  size = "40px",
  color 
}) => {
  const fishColor = useColorModeValue(
    color || "blue.500",
    color || "blue.300"
  );

  return (
    <Box
      position="relative"
      width="120px"
      height="60px"
      overflow="hidden"
    >
      <Box
        width={size}
        height={size}
        bg={fishColor}
        borderRadius="0 50% 50% 50%"
        position="relative"
        animation="swimAcross 3s infinite ease-in-out"
        _before={{
          content: '""',
          position: 'absolute',
          right: '-8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '0',
          height: '0',
          borderLeft: '12px solid',
          borderLeftColor: fishColor,
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
        }}
        _after={{
          content: '""',
          position: 'absolute',
          left: '8px',
          top: '8px',
          width: '4px',
          height: '4px',
          bg: 'white',
          borderRadius: '50%',
        }}
      />
    </Box>
  );
};

// Bubble Stream Loader
const BubbleStreamLoader: React.FC<{
  size?: string;
  color?: string;
}> = ({ 
  size = "60px",
  color 
}) => {
  const bubbleColor = useColorModeValue(
    color || "blue.400",
    color || "blue.200"
  );

  return (
    <Flex
      width={size}
      height={size}
      position="relative"
      justify="space-around"
      align="flex-end"
    >
      {[...Array(4)].map((_, index) => (
        <Box
          key={index}
          width="8px"
          height="8px"
          bg={bubbleColor}
          borderRadius="50%"
          animation={`bubbleUp ${1.5 + (index * 0.3)}s infinite ease-in-out`}
          sx={{
            animationDelay: `${index * 0.2}s`
          }}
          opacity="0.8"
        />
      ))}
    </Flex>
  );
};

// Wave Ripple Loader
const WaveRippleLoader: React.FC<{
  size?: string;
  color?: string;
}> = ({ 
  size = "50px",
  color 
}) => {
  const waveColor = useColorModeValue(
    color || "blue.300",
    color || "blue.100"
  );

  return (
    <Box
      position="relative"
      width={size}
      height={size}
    >
      {[...Array(3)].map((_, index) => (
        <Box
          key={index}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="100%"
          height="100%"
          border="2px solid"
          borderColor={waveColor}
          borderRadius="50%"
          animation={`waveRipple ${2}s infinite ease-out`}
          sx={{
            animationDelay: `${index * 0.6}s`
          }}
        />
      ))}
    </Box>
  );
};

// Swimming Stroke Loader
const SwimmingStrokeLoader: React.FC<{
  size?: string;
  color?: string;
}> = ({ 
  size = "40px",
  color 
}) => {
  const strokeColor = useColorModeValue(
    color || "blue.600",
    color || "blue.400"
  );

  return (
    <Box
      position="relative"
      width={size}
      height={size}
    >
      {[...Array(4)].map((_, index) => (
        <Box
          key={index}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="4px"
          height="60%"
          bg={strokeColor}
          borderRadius="2px"
          transformOrigin="center bottom"
          animation={`swimStroke ${1.5}s infinite linear`}
          sx={{
            animationDelay: `${index * 0.375}s`,
            transform: `translate(-50%, -50%) rotate(${index * 90}deg)`
          }}
        />
      ))}
    </Box>
  );
};

// Floating Elements Loader (Pool toys)
const FloatingElementsLoader: React.FC<{
  size?: string;
  color?: string;
}> = ({ 
  size = "80px",
  color 
}) => {
  const elementColors = [
    useColorModeValue("orange.400", "orange.300"),
    useColorModeValue("green.400", "green.300"),
    useColorModeValue("purple.400", "purple.300"),
  ];

  return (
    <Box
      position="relative"
      width={size}
      height={size}
    >
      {[...Array(3)].map((_, index) => (
        <Box
          key={index}
          position="absolute"
          width="16px"
          height="16px"
          bg={color || elementColors[index]}
          borderRadius={index === 0 ? "50%" : index === 1 ? "4px" : "0 50% 50% 50%"}
          animation={`bubbleUp ${2 + (index * 0.5)}s infinite ease-in-out`}
          sx={{
            animationDelay: `${index * 0.4}s`
          }}
          left={`${20 + (index * 25)}%`}
          bottom="0"
        />
      ))}
    </Box>
  );
};

// Comprehensive Swimming Loader Component
export const SwimmingLoader: React.FC<{
  type?: 'fish' | 'bubbles' | 'waves' | 'stroke' | 'floating';
  size?: string;
  color?: string;
}> = ({ 
  type = 'fish',
  size = "40px",
  color 
}) => {
  switch (type) {
    case 'fish':
      return <SwimmingFishLoader size={size} color={color} />;
    case 'bubbles':
      return <BubbleStreamLoader size={size} color={color} />;
    case 'waves':
      return <WaveRippleLoader size={size} color={color} />;
    case 'stroke':
      return <SwimmingStrokeLoader size={size} color={color} />;
    case 'floating':
      return <FloatingElementsLoader size={size} color={color} />;
    default:
      return <SwimmingFishLoader size={size} color={color} />;
  }
};

export {
  SwimmingFishLoader,
  BubbleStreamLoader,
  WaveRippleLoader,
  SwimmingStrokeLoader,
  FloatingElementsLoader,
};
