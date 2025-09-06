import React from 'react'
import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { TimeIcon, StarIcon, SearchIcon, CalendarIcon } from '@chakra-ui/icons'
import type { SwimRecord } from '../services/api'

const MotionBox = motion(Box)

interface PerformanceSummaryCardsProps {
  records: SwimRecord[]
}

const PerformanceSummaryCards: React.FC<PerformanceSummaryCardsProps> = ({ records }) => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Calculate statistics from real data
  const totalSwims = records.length
  const differentStrokes = new Set(records.map(record => record.stroke)).size
  
  // Find stroke with maximum WA points
  const bestWAPoints = Math.max(...records.map(record => record.waPoints), 0)
  const bestRecord = records.find(record => record.waPoints === bestWAPoints)
  const bestStroke = bestRecord ? bestRecord.stroke : 'N/A'
  
  const distances = new Set(records.map(record => record.distance)).size
  const venues = new Set(records.map(record => record.venue)).size
  const meets = new Set(records.map(record => record.meet)).size

  const mainCards = [
    {
      title: 'Total Swims',
      value: totalSwims,
      description: 'Races completed across all events',
      icon: CalendarIcon,
      bg: 'blue.50',
      iconBg: 'blue.100',
      iconColor: 'blue.500',
      borderTop: 'blue.400',
    },
    {
      title: 'Different Strokes',
      value: differentStrokes,
      description: 'Swimming styles mastered',
      icon: SearchIcon,
      bg: 'purple.50',
      iconBg: 'purple.100',
      iconColor: 'purple.500',
      borderTop: 'purple.400',
    },
    {
      title: 'Best Stroke',
      value: `${bestStroke} - ${bestWAPoints}`,
      description: 'Highest WA points stroke',
      icon: StarIcon,
      bg: 'teal.50',
      iconBg: 'teal.100',
      iconColor: 'teal.500',
      borderTop: 'teal.400',
    },
  ]

  const statsCards = [
    { label: 'Best WA Points', value: bestWAPoints, color: 'green.500' },
    { label: 'Distances', value: distances, color: 'orange.500' },
    { label: 'Venues', value: venues, color: 'pink.500' },
    { label: 'Meets', value: meets, color: 'blue.500' },
  ]

  return (
    <Box>
      {/* Header */}
      <HStack mb={6} spacing={3}>
        <Icon as={TimeIcon} color="blue.500" boxSize={6} />
        <Text fontSize="xl" fontWeight="bold" color="blue.600">
          Performance Summary
        </Text>
      </HStack>

      {/* Main Cards Grid */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} mb={6}>
        {mainCards.map((card, index) => (
          <GridItem key={card.title}>
            <MotionBox
              bg={bg}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              borderTop="4px solid"
              borderTopColor={card.borderTop}
              p={6}
              shadow="sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              _hover={{
                shadow: 'md',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <VStack spacing={4} align="center">
                {/* Icon */}
                <Box
                  bg={card.iconBg}
                  p={3}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={card.icon} boxSize={6} color={card.iconColor} />
                </Box>

                {/* Value */}
                <Text
                  fontSize="4xl"
                  fontWeight="bold"
                  color="gray.800"
                  lineHeight="1"
                >
                  {card.value}
                </Text>

                {/* Title */}
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  color="gray.700"
                  textAlign="center"
                >
                  {card.title}
                </Text>

                {/* Description */}
                <Text
                  fontSize="sm"
                  color="gray.500"
                  textAlign="center"
                  lineHeight="1.4"
                >
                  {card.description}
                </Text>
              </VStack>
            </MotionBox>
          </GridItem>
        ))}
      </Grid>

      {/* Stats Row */}
      <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
        {statsCards.map((stat, index) => (
          <GridItem key={stat.label}>
            <MotionBox
              bg={bg}
              borderRadius="lg"
              border="1px solid"
              borderColor={borderColor}
              p={4}
              textAlign="center"
              shadow="sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              _hover={{
                shadow: 'md',
                transform: 'scale(1.02)',
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
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                {stat.label}
              </Text>
            </MotionBox>
          </GridItem>
        ))}
      </Grid>
    </Box>
  )
}

export default PerformanceSummaryCards
