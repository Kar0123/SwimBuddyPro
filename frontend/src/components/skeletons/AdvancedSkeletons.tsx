import React from 'react';
import {
  Box,
  VStack,
  HStack,
  SkeletonCircle,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
} from '@chakra-ui/react';

// Wave animation keyframes for enhanced skeletons
const waveAnimation = `
  @keyframes wave {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const pulseGlow = `
  @keyframes pulseGlow {
    0%, 100% {
      opacity: 0.6;
      box-shadow: 0 0 20px rgba(0, 188, 212, 0.1);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 30px rgba(0, 188, 212, 0.3);
    }
  }
`;

// Inject animations into document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = waveAnimation + pulseGlow;
  document.head.appendChild(style);
}

// Enhanced Skeleton Box with wave effect
const SkeletonWave: React.FC<{
  height?: string;
  width?: string;
  borderRadius?: string;
  bg?: string;
}> = ({ height = '20px', width = '100%', borderRadius = '8px', bg = 'gray.200' }) => (
  <Box
    position="relative"
    height={height}
    width={width}
    bg={bg}
    borderRadius={borderRadius}
    overflow="hidden"
    _after={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
      animation: 'wave 1.8s infinite ease-in-out',
    }}
  />
);

// Swimming-themed skeleton card
export const SkeletonCard: React.FC<{
  showHeader?: boolean;
  bodyLines?: number;
  animated?: boolean;
}> = ({ 
  showHeader = true, 
  bodyLines = 3,
  animated = true 
}) => (
  <Card
    bg="rgba(255, 255, 255, 0.95)"
    backdropFilter="blur(10px)"
    borderRadius="20px"
    overflow="hidden"
    position="relative"
    animation={animated ? 'pulseGlow 2s infinite ease-in-out' : undefined}
    _before={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      bgGradient: 'linear(to-r, aqua.300, primary.300, ocean.300)',
      opacity: 0.7,
    }}
  >
    {showHeader && (
      <CardHeader pb={2}>
        <HStack spacing={3}>
          <SkeletonCircle size="12" bg="aqua.100" />
          <VStack align="start" spacing={2} flex={1}>
            <SkeletonWave height="20px" width="60%" bg="aqua.100" />
            <SkeletonWave height="14px" width="40%" bg="gray.100" />
          </VStack>
        </HStack>
      </CardHeader>
    )}
    <CardBody pt={showHeader ? 0 : 6}>
      <VStack spacing={3} align="stretch">
        {Array.from({ length: bodyLines }).map((_, index) => (
          <SkeletonWave
            key={index}
            height="16px"
            width={`${100 - (index * 10)}%`}
            bg="gray.100"
          />
        ))}
      </VStack>
    </CardBody>
  </Card>
);

// Stat card skeleton with aquatic theme
export const SkeletonStatCard: React.FC = () => (
  <Card
    bg="rgba(255, 255, 255, 0.9)"
    backdropFilter="blur(15px)"
    borderRadius="16px"
    p={6}
    position="relative"
    overflow="hidden"
    animation="pulseGlow 2.5s infinite ease-in-out"
    _before={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      bgGradient: 'linear(to-r, wave.400, aqua.400)',
      opacity: 0.8,
    }}
  >
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <SkeletonWave height="24px" width="120px" bg="primary.100" />
        <SkeletonCircle size="8" bg="aqua.100" />
      </HStack>
      <SkeletonWave height="36px" width="80px" bg="primary.200" />
      <SkeletonWave height="14px" width="60%" bg="gray.100" />
    </VStack>
  </Card>
);

// Chart skeleton with animated elements
export const SkeletonChart: React.FC<{ height?: string }> = ({ height = '400px' }) => (
  <Card
    bg="rgba(255, 255, 255, 0.95)"
    backdropFilter="blur(10px)"
    borderRadius="20px"
    overflow="hidden"
    position="relative"
  >
    <CardHeader>
      <HStack spacing={4}>
        <Box 
          bg="purple.100" 
          p={3} 
          borderRadius="xl"
          animation="pulseGlow 2s infinite ease-in-out"
        >
          <SkeletonWave height="24px" width="24px" bg="purple.200" />
        </Box>
        <VStack align="start" spacing={2}>
          <SkeletonWave height="24px" width="200px" bg="purple.100" />
          <SkeletonWave height="16px" width="300px" bg="gray.100" />
        </VStack>
      </HStack>
    </CardHeader>
    <CardBody>
      <Box
        height={height}
        bg="gray.50"
        borderRadius="16px"
        position="relative"
        overflow="hidden"
        p={6}
      >
        {/* Animated chart bars */}
        <HStack spacing={2} height="100%" align="end" justify="space-around">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonWave
              key={index}
              height={`${Math.random() * 80 + 20}%`}
              width="40px"
              bg="aqua.200"
              borderRadius="4px 4px 0 0"
            />
          ))}
        </HStack>
        
        {/* Wave overlay for chart */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          _after={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '200%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.1), transparent)',
            animation: 'wave 3s infinite ease-in-out',
          }}
        />
      </Box>
    </CardBody>
  </Card>
);

// Table skeleton with row animations
export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Card
    bg="rgba(255, 255, 255, 0.95)"
    backdropFilter="blur(10px)"
    borderRadius="20px"
    overflow="hidden"
  >
    <CardHeader>
      <HStack spacing={4}>
        <SkeletonCircle size="10" bg="blue.100" />
        <VStack align="start" spacing={2} flex={1}>
          <SkeletonWave height="20px" width="40%" bg="blue.100" />
          <SkeletonWave height="14px" width="60%" bg="gray.100" />
        </VStack>
      </HStack>
    </CardHeader>
    <CardBody>
      <VStack spacing={3} align="stretch">
        {/* Table header */}
        <HStack spacing={4} py={3} borderBottom="1px" borderColor="gray.100">
          <SkeletonWave height="16px" width="15%" bg="gray.200" />
          <SkeletonWave height="16px" width="20%" bg="gray.200" />
          <SkeletonWave height="16px" width="15%" bg="gray.200" />
          <SkeletonWave height="16px" width="25%" bg="gray.200" />
          <SkeletonWave height="16px" width="25%" bg="gray.200" />
        </HStack>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <HStack
            key={index}
            spacing={4}
            py={3}
            borderBottom="1px"
            borderColor="gray.50"
            opacity={1 - (index * 0.1)}
          >
            <SkeletonWave height="14px" width="15%" bg="aqua.100" />
            <SkeletonWave height="14px" width="20%" bg="gray.100" />
            <SkeletonWave height="14px" width="15%" bg="primary.100" />
            <SkeletonWave height="14px" width="25%" bg="gray.100" />
            <SkeletonWave height="14px" width="25%" bg="gray.100" />
          </HStack>
        ))}
      </VStack>
    </CardBody>
  </Card>
);

// Personal bests skeleton grid
export const SkeletonPersonalBests: React.FC = () => (
  <VStack spacing={6} align="stretch">
    <HStack spacing={4}>
      <Box 
        bg="blue.100" 
        p={3} 
        borderRadius="xl"
        animation="pulseGlow 2s infinite ease-in-out"
      >
        <SkeletonWave height="24px" width="24px" bg="blue.200" />
      </Box>
      <VStack align="start" spacing={2}>
        <SkeletonWave height="24px" width="200px" bg="blue.100" />
        <SkeletonWave height="16px" width="300px" bg="gray.100" />
      </VStack>
    </HStack>
    
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          bg="rgba(255, 255, 255, 0.9)"
          backdropFilter="blur(15px)"
          borderRadius="16px"
          p={4}
          position="relative"
          overflow="hidden"
          animation={`pulseGlow ${2 + (index * 0.2)}s infinite ease-in-out`}
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            bgGradient: 'linear(to-r, aqua.400, primary.400)',
            opacity: 0.7,
          }}
        >
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <SkeletonWave height="18px" width="100px" bg="aqua.100" />
              <SkeletonWave height="20px" width="40px" bg="primary.100" borderRadius="12px" />
            </HStack>
            <SkeletonWave height="32px" width="80px" bg="primary.200" />
            <SkeletonWave height="14px" width="70%" bg="gray.100" />
            <HStack spacing={2}>
              <SkeletonWave height="12px" width="30%" bg="gray.100" />
              <SkeletonWave height="12px" width="25%" bg="gray.100" />
            </HStack>
          </VStack>
        </Card>
      ))}
    </SimpleGrid>
  </VStack>
);

// Dashboard skeleton with staggered animations
export const SkeletonDashboard: React.FC = () => (
  <VStack spacing={8} align="stretch">
    {/* Header skeleton */}
    <SkeletonCard 
      showHeader={true} 
      bodyLines={2}
      animated={true}
    />
    
    {/* Stats grid skeleton */}
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Box
          key={index}
          style={{
            animationDelay: `${index * 0.2}s`,
          }}
        >
          <SkeletonStatCard />
        </Box>
      ))}
    </SimpleGrid>
    
    {/* Personal bests skeleton */}
    <Box
      style={{
        animationDelay: '0.8s',
      }}
    >
      <SkeletonPersonalBests />
    </Box>
    
    {/* Chart skeleton */}
    <Box
      style={{
        animationDelay: '1.2s',
      }}
    >
      <SkeletonChart />
    </Box>
    
    {/* Table skeleton */}
    <Box
      style={{
        animationDelay: '1.6s',
      }}
    >
      <SkeletonTable />
    </Box>
  </VStack>
);

export {
  SkeletonWave,
  waveAnimation,
  pulseGlow,
};
