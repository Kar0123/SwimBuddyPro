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
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

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
      bgColor: 'blue.50',
      iconBg: 'blue.100',
      iconColor: 'blue.500',
      numberColor: 'blue.600',
    },
    {
      title: 'Different Strokes',
      subtitle: 'Swimming styles mastered',
      value: differentStrokes.toString(),
      icon: SearchIcon,
      bgColor: 'purple.50',
      iconBg: 'purple.100',
      iconColor: 'purple.500',
      numberColor: 'purple.600',
    },
    {
      title: 'Personal Bests',
      subtitle: `Best in ${bestStroke}`,
      value: bestWAPoints.toString(),
      icon: StarIcon,
      bgColor: 'green.50',
      iconBg: 'green.100',
      iconColor: 'green.500',
      numberColor: 'green.600',
    },
  ]

  // Bottom stats
  const bottomStats = [
    { label: 'Best WA Points', value: bestWAPoints, color: 'green.500' },
    { label: 'Distances', value: distances, color: 'orange.500' },
    { label: 'Venues', value: venues, color: 'pink.500' },
    { label: 'Meets', value: meets, color: 'cyan.500' },
  ]

  return (
    <Box>
      {/* Header */}
      <HStack mb={6} spacing={4} align="center">
        <Box
          bg="blue.500"
          color="white"
          px={4}
          py={2}
          borderRadius="md"
          fontWeight="bold"
          fontSize="lg"
        >
          📊 Performance Summary
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
                bg={card.bgColor}
                borderRadius="2xl"
                border="1px solid"
                borderColor={borderColor}
                p={8}
                textAlign="center"
                shadow="sm"
                _hover={{
                  shadow: 'md',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {/* Icon in Circle */}
                <Circle
                  size="80px"
                  bg={card.iconBg}
                  mx="auto"
                  mb={6}
                >
                  <Icon as={card.icon} boxSize={10} color={card.iconColor} />
                </Circle>

                {/* Large Number */}
                <Text
                  fontSize="5xl"
                  fontWeight="bold"
                  color={card.numberColor}
                  lineHeight="1"
                  mb={2}
                >
                  {card.value}
                </Text>

                {/* Title */}
                <Text
                  fontSize="xl"
                  fontWeight="semibold"
                  color={textColor}
                  mb={2}
                >
                  {card.title}
                </Text>

                {/* Subtitle */}
                <Text
                  fontSize="sm"
                  color="gray.500"
                  lineHeight="1.4"
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
                bg={cardBg}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={4}
                textAlign="center"
                shadow="sm"
                _hover={{
                  shadow: 'md',
                  borderColor: stat.color,
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={stat.color}
                  lineHeight="1"
                  mb={1}
                >
                  {stat.value}
                </Text>
                <Text
                  fontSize="sm"
                  color="gray.500"
                  fontWeight="medium"
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
