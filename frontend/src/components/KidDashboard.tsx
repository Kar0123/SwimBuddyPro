import {
  Box,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Avatar,
  Flex,
  Spacer,
  useColorModeValue,
  SimpleGrid
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useCallback } from 'react'
import type { SwimmerData } from '../services/api'
import { EnhancedPerformanceChart } from './EnhancedPerformanceChart'
import { PersonalBestsCards } from './PersonalBestsCards'
import { RaceHistoryTable } from './RaceHistoryTable'
import PerformanceSummaryCards from './PerformanceSummaryCards'
import { SkeletonDashboard } from './skeletons/AdvancedSkeletons'
import { SwimmingLoader } from './animations/SwimmingLoaders'

const MotionBox = motion(Box)

interface KidDashboardProps {
  swimmer: SwimmerData
  isLoading: boolean
}

export const KidDashboard = ({ swimmer, isLoading }: KidDashboardProps) => {
  const cardBg = useColorModeValue('white', 'gray.700')
  const statBg = useColorModeValue('gray.50', 'gray.600')
  const accentColor = useColorModeValue('primary.500', 'primary.300')

  // Handle filter changes from Performance Chart with memoization  
  const handleFilterChange = useCallback((_distance: string, _stroke: string, _poolType: string) => {
    // This callback is passed to the chart component but we don't need to track state here
    // since the comparison is now integrated inside the chart component
  }, [])

  if (isLoading || !swimmer) {
    return (
      <VStack spacing={8} align="stretch">
        {/* Centered loading animation */}
        <Flex justify="center" align="center" py={8}>
          <VStack spacing={4}>
            <SwimmingLoader type="fish" size="60px" color="blue.500" />
            <Text fontSize="md" color="gray.500">
              Loading swimmer dashboard...
            </Text>
          </VStack>
        </Flex>
        
        {/* Advanced skeleton dashboard */}
        <SkeletonDashboard />
      </VStack>
    )
  }

  const stats = swimmer.stats
  
  // Get races from the most recent meet (including multi-day events)
  const getRecentMeetRaces = () => {
    // Sort all records by date descending to find the most recent
    const sortedRecords = [...swimmer.records]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (sortedRecords.length === 0) return []
    
    // Get the most recent race to determine the most recent meet
    const mostRecentRace = sortedRecords[0]
    const mostRecentMeet = mostRecentRace.meet
    const mostRecentDate = new Date(mostRecentRace.date)
    
    // Find all races from the same meet within ±1 day (for multi-day meets)
    const meetRaces = sortedRecords.filter(race => {
      const raceDate = new Date(race.date)
      const daysDifference = Math.abs((raceDate.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      return race.meet === mostRecentMeet && daysDifference <= 1
    })
    
    // Sort meet races by date and time for proper chronological order
    return meetRaces.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  
  const recentRaces = getRecentMeetRaces()
  const recentMeetName = recentRaces.length > 0 ? recentRaces[0].meet : ''
  
  const strokeColors: Record<string, string> = {
    'Freestyle': 'blue.500',
    'Backstroke': 'purple.500',
    'Breaststroke': 'green.500',
    'Butterfly': 'orange.500',
    'Individual Medley': 'pink.500'
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Swimmer Header */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card bg={cardBg} borderWidth={2} borderColor={accentColor}>
          <CardBody>
            <Flex align="center">
              <Avatar
                size="xl"
                name={swimmer.name}
                bg="primary.500"
                color="white"
                fontWeight="bold"
                fontSize="xl"
              />
              <VStack align="start" spacing={1} ml={6}>
                <Heading size="lg" color={accentColor}>
                  🏊‍♀️ {swimmer.name}
                </Heading>
                <Text color="gray.600" fontSize="md">
                  {swimmer.club} • Member #{swimmer.tiref}
                </Text>
                <HStack>
                  <Badge colorScheme="primary" variant="subtle">
                    {stats.currentSeason} Season
                  </Badge>
                  <Badge colorScheme="aqua" variant="subtle">
                    {stats.competitionSpan.yearsActive} Years Active
                  </Badge>
                  <Badge colorScheme="wave" variant="subtle">
                    {stats.seasonsCompeted.length} Seasons
                  </Badge>
                </HStack>
              </VStack>
              <Spacer />
              <VStack align="end" spacing={1}>
                <Text fontSize="sm" color="gray.500">Last Updated</Text>
                <Text fontSize="sm" fontWeight="bold">
                  {new Date(swimmer.lastUpdated).toLocaleDateString()}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {stats.totalRaces} total races
                </Text>
              </VStack>
            </Flex>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Performance Summary Cards */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <PerformanceSummaryCards records={swimmer.records} />
      </MotionBox>

      {/* Personal Bests Cards Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <PersonalBestsCards tiref={swimmer.tiref} />
      </MotionBox>

      {/* Performance Analytics Section - Full Width */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <VStack spacing={8} align="stretch">
          {/* Section Header */}
          <HStack spacing={4} align="center">
            <Box 
              bg="purple.100" 
              p={3} 
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="2xl">📊</Text>
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="black" color="purple.700" letterSpacing="tight">
                Performance Analytics
              </Text>
              <Text fontSize="md" color="gray.600" fontWeight="medium">
                Interactive charts and performance comparisons
              </Text>
            </VStack>
          </HStack>

          {/* Chart Section */}
          <Box
            bg={cardBg}
            borderRadius="2xl"
            shadow="lg"
            borderWidth="2px"
            borderColor={useColorModeValue('purple.200', 'purple.600')}
            overflow="hidden"
          >
            <EnhancedPerformanceChart 
              records={swimmer.records}
              personalBests={swimmer.personalBests}
              onFilterChange={handleFilterChange}
            />
          </Box>
        </VStack>
      </MotionBox>

      {/* Recent Races Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card bg={cardBg}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md" color="primary.600">
                Recent Meet
              </Heading>
              <Badge colorScheme="primary" variant="subtle">
                {recentRaces.length} race{recentRaces.length !== 1 ? 's' : ''} • {recentMeetName}
              </Badge>
            </Flex>
          </CardHeader>
          <CardBody>
            {recentRaces.length > 0 ? (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {recentRaces.map((race, index) => (
                    <Box
                      key={index}
                      p={4}
                      bg={statBg}
                      borderRadius="lg"
                      borderLeft="4px solid"
                      borderLeftColor={strokeColors[race.stroke] || 'gray.400'}
                      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                      minH="140px"
                    >
                      {/* Header Row - Event & Time */}
                      <VStack spacing={3} align="stretch" h="full">
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Text fontWeight="bold" fontSize="sm" color="primary.700">
                                {race.distance}m {race.stroke}
                              </Text>
                              <Badge 
                                colorScheme={race.poolType === 'LC' ? 'blue' : 'green'}
                                variant="subtle" 
                                size="xs"
                              >
                                {race.poolType}
                              </Badge>
                            </HStack>
                            <Text fontSize="lg" fontWeight="bold" color="primary.600">
                              {race.time}
                            </Text>
                          </VStack>
                          
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                              {race.waPoints} pts
                            </Text>
                            {race.isPersonalBest && (
                              <Badge colorScheme="green" variant="solid" size="xs">
                                🏆 PB
                              </Badge>
                            )}
                          </VStack>
                        </HStack>

                        {/* Middle Row - Round & Rank */}
                        <HStack justify="space-between" align="center">
                          <HStack spacing={2}>
                            {race.rank && (
                              <Badge colorScheme="purple" variant="subtle" size="xs">
                                #{race.rank}
                              </Badge>
                            )}
                          </HStack>
                          
                          {race.heat && race.lane && (
                            <Text fontSize="xs" color="gray.500">
                              H{race.heat} L{race.lane}
                            </Text>
                          )}
                        </HStack>

                        {/* Bottom Row - Date & Improvement */}
                        <HStack justify="space-between" align="center">
                          <Text fontSize="xs" color="gray.600">
                            {new Date(race.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </Text>
                          
                          {race.improvementFromPrevious && (
                            <Text 
                              fontSize="xs" 
                              color={race.improvementFromPrevious < 0 ? "green.500" : "red.500"}
                              fontWeight="500"
                            >
                              {race.improvementFromPrevious < 0 ? "↗️" : "↘️"} 
                              {Math.abs(race.improvementFromPrevious).toFixed(2)}s
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
                
                {/* Meet Details Footer */}
                <Box mt={2} p={3} bg={statBg} borderRadius="md">
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={3}>
                      <HStack spacing={1}>
                        <Text fontSize="xs" color="gray.500" fontWeight="500">🏆</Text>
                        <Text fontSize="sm" color="gray.700" fontWeight="600">
                          {recentMeetName}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.400">•</Text>
                      <HStack spacing={1}>
                        <Text fontSize="xs" color="gray.500" fontWeight="500">📍</Text>
                        <Text fontSize="sm" color="gray.600">
                          {recentRaces[0]?.venue}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.400">•</Text>
                      <HStack spacing={1}>
                        <Text fontSize="xs" color="gray.500" fontWeight="500">�</Text>
                        <Text fontSize="sm" color="gray.600">
                          Season {recentRaces[0]?.season}
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Text fontSize="lg" color="gray.500" mb={2}>
                  No recent meet data available
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Race data will appear here once meets are available
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </MotionBox>

      {/* Complete Race History Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <RaceHistoryTable records={swimmer.records} />
      </MotionBox>
    </VStack>
  )
}
