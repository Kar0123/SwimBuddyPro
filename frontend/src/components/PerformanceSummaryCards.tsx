import React from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Circle,
  SimpleGrid,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { TimeIcon, StarIcon, SearchIcon } from '@chakra-ui/icons'
import type { SwimRecord } from '../services/api'

interface PerformanceSummaryCardsProps {
  records: SwimRecord[]
}

const PerformanceSummaryCards: React.FC<PerformanceSummaryCardsProps> = ({ records }) => {

  // Calculate statistics from real data
  const totalSwims = records.length
  const differentStrokes = new Set(records.map(record => record.stroke)).size
  
  // Find best stroke (highest WA points)
  const bestWAPoints = Math.max(...records.map(record => record.waPoints), 0)
  const bestRecord = records.find(record => record.waPoints === bestWAPoints)
  const bestStroke = bestRecord ? bestRecord.stroke : 'N/A'

  // Bottom row stats
  const distances = new Set(records.map(record => record.distance)).size
  const venues = new Set(records.map(record => record.venue)).size
  const meets = new Set(records.map(record => record.meet)).size

  // Main performance cards
  const mainCards = [
    {
      title: 'Total Swims',
      subtitle: 'Races completed across all events',
      value: totalSwims.toString(),
      icon: TimeIcon,
      bgColor: 'turquoise.50',
      iconBg: 'turquoise.100',
      iconColor: 'turquoise.500',
      numberColor: 'turquoise.600',
    },
    {
      title: 'Different Strokes',
      subtitle: 'Swimming styles mastered',
      value: differentStrokes.toString(),
      icon: SearchIcon,
      bgColor: 'seafoam.50',
      iconBg: 'seafoam.100',
      iconColor: 'seafoam.500',
      numberColor: 'seafoam.600',
    },
    {
      title: 'Personal Bests',
      subtitle: `Best in ${bestStroke}`,
      value: bestWAPoints.toString(),
      icon: StarIcon,
      bgColor: 'coral.50',
      iconBg: 'coral.100',
      iconColor: 'coral.500',
      numberColor: 'coral.600',
    },
  ]

  // Bottom stats
  const bottomStats = [
    { label: 'Best WA Points', value: bestWAPoints, color: 'turquoise.500' },
    { label: 'Distances', value: distances, color: 'tropical.500' },
    { label: 'Venues', value: venues, color: 'coral.500' },
    { label: 'Meets', value: meets, color: 'seafoam.500' },
  ]

  return (
    <Box>
      {/* Header */}
      <HStack mb={6} spacing={4} align="center">
        <Box
          bg="turquoise.500"
          color="white"
          px={4}
          py={2}
          borderRadius="xl"
          fontWeight="bold"
          fontSize="lg"
          letterSpacing="-0.02em"
          shadow="md"
        >
          🌊 Performance Summary
        </Box>
      </HStack>

      <VStack spacing={6} align="stretch">
        {/* Main Cards - Top Row */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {mainCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Box
                borderRadius="2xl"
                border="2px solid"
                borderColor={useColorModeValue('white', 'whiteAlpha.300')}
                backdropFilter="blur(15px)"
                bgGradient={useColorModeValue(
                  `linear(135deg, ${card.bgColor}, whiteAlpha.900, ${card.iconBg})`,
                  `linear(135deg, ${card.iconColor}Alpha.200, blackAlpha.400, ${card.bgColor})`
                )}
                p={8}
                textAlign="center"
                shadow="xl"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgGradient: `linear(45deg, ${card.iconColor}Alpha.100, transparent, ${card.iconColor}Alpha.050)`,
                  opacity: 0.8,
                  zIndex: 0,
                }}
                _hover={{
                  shadow: '2xl',
                  transform: 'translateY(-6px) scale(1.03)',
                  borderColor: card.iconColor,
                  bgGradient: useColorModeValue(
                    `linear(135deg, ${card.iconColor}Alpha.200, ${card.bgColor}, whiteAlpha.800)`,
                    `linear(135deg, ${card.iconColor}Alpha.300, blackAlpha.300, ${card.bgColor})`
                  ),
                  transition: 'all 0.4s ease-in-out',
                }}
              >
                {/* Icon in Circle */}
                <Circle
                  size="80px"
                  bgGradient={`linear(135deg, ${card.iconBg}, ${card.iconColor})`}
                  mx="auto"
                  mb={6}
                  shadow="lg"
                  border="3px solid"
                  borderColor="white"
                  position="relative"
                  zIndex={1}
                  _hover={{
                    shadow: `0 0 30px ${card.iconColor}`,
                    transform: 'scale(1.1) rotate(5deg)',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <Icon as={card.icon} boxSize={10} color="white" />
                </Circle>

                {/* Large Number */}
                <Text
                  fontSize="5xl"
                  fontWeight="bold"
                  bgGradient={`linear(45deg, ${card.numberColor}, ${card.iconColor})`}
                  bgClip="text"
                  lineHeight="1"
                  mb={2}
                  letterSpacing="-0.03em"
                  position="relative"
                  zIndex={1}
                  textShadow="0 2px 10px rgba(0,0,0,0.1)"
                >
                  {card.value}
                </Text>

                {/* Title */}
                <Text
                  fontSize="xl"
                  fontWeight="semibold"
                  color={useColorModeValue('gray.800', 'white')}
                  mb={2}
                  letterSpacing="-0.02em"
                  position="relative"
                  zIndex={1}
                >
                  {card.title}
                </Text>

                {/* Subtitle */}
                <Text
                  fontSize="sm"
                  color={useColorModeValue('gray.600', 'gray.300')}
                  lineHeight="1.4"
                  fontFamily="aquatic"
                  position="relative"
                  zIndex={1}
                >
                  {card.subtitle}
                </Text>
              </Box>
            </motion.div>
          ))}
        </SimpleGrid>

        {/* Bottom Stats Row */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {bottomStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              <Box
                borderRadius="xl"
                border="2px solid"
                borderColor={useColorModeValue('white', 'whiteAlpha.300')}
                backdropFilter="blur(10px)"
                bgGradient={useColorModeValue(
                  `linear(135deg, whiteAlpha.800, ${stat.color}Alpha.100)`,
                  `linear(135deg, blackAlpha.300, ${stat.color}Alpha.200)`
                )}
                p={4}
                textAlign="center"
                shadow="lg"
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgGradient: `radial(circle at 30% 30%, ${stat.color}Alpha.150, transparent)`,
                  opacity: 0.6,
                  zIndex: 0,
                }}
                _hover={{
                  shadow: `0 8px 25px ${stat.color}Alpha.300`,
                  borderColor: stat.color,
                  transform: 'translateY(-3px) scale(1.05)',
                  bgGradient: useColorModeValue(
                    `linear(135deg, ${stat.color}Alpha.200, whiteAlpha.900)`,
                    `linear(135deg, ${stat.color}Alpha.300, blackAlpha.200)`
                  ),
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  bgGradient={`linear(45deg, ${stat.color}, ${stat.color})`}
                  bgClip="text"
                  lineHeight="1"
                  mb={1}
                  letterSpacing="-0.03em"
                  position="relative"
                  zIndex={1}
                  textShadow="0 2px 8px rgba(0,0,0,0.1)"
                >
                  {stat.value}
                </Text>
                <Text
                  fontSize="sm"
                  color={useColorModeValue('gray.600', 'gray.300')}
                  fontWeight="medium"
                  fontFamily="aquatic"
                  position="relative"
                  zIndex={1}
                >
                  {stat.label}
                </Text>
              </Box>
            </motion.div>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default PerformanceSummaryCards
