import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Card,
  Heading,
  Badge,
  Stack
} from '@chakra-ui/react'
import { ChevronUpIcon, ChevronDownIcon, MinusIcon, TimeIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import type { SwimRecord, PersonalBest } from '../services/api'
import { personalBestsCardsApi } from '../services/api'

interface PersonalBestCardData {
  event_name: string
  stroke: string
  distance: number
  primary_best: {
    time: string
    time_seconds: number
    pool_type: string
    date: string
    meet_name: string
    venue: string
    wa_points: number
  }
}

interface RecentPerformanceComparisonProps {
  records: SwimRecord[]
  personalBests?: PersonalBest[] // Legacy prop - now using PersonalBestCards API
  selectedDistance?: string
  selectedStroke?: string
  selectedPoolType?: string
  tiref?: string  // Add tiref to fetch PersonalBestsCards data
}

export const RecentPerformanceComparison = ({
  records,
  personalBests: _personalBests, // Legacy prop - not used anymore
  selectedDistance,
  selectedStroke,
  selectedPoolType,
  tiref
}: RecentPerformanceComparisonProps) => {
  const [personalBestCards, setPersonalBestCards] = useState<PersonalBestCardData[]>([])

  // Fetch PersonalBestsCards data for accurate PB information
  useEffect(() => {
    const fetchPersonalBestCards = async () => {
      if (!tiref) {
        return
      }
      
      try {
        const data = await personalBestsCardsApi(tiref)
        setPersonalBestCards(data.personal_bests || [])
      } catch (error) {
        console.error('❌ Error fetching personal best cards:', error)
        setPersonalBestCards([])
      }
    }

    fetchPersonalBestCards()
  }, [tiref])

  // Helper function to safely format dates
  const formatSafeDate = (dateString: string | undefined | null): string => {
    if (!dateString || dateString.trim() === '') {
      return 'No date'
    }
    
    try {
      const date = new Date(dateString)
      // Check if date is valid and not the Unix epoch
      if (isNaN(date.getTime()) || date.getTime() === 0) {
        return 'Invalid date'
      }
      
      // Check if it's the Unix epoch (1970-01-01)
      if (date.getFullYear() === 1970 && date.getMonth() === 0 && date.getDate() === 1) {
        return 'No date'
      }
      
      return date.toLocaleDateString()
    } catch (error) {
      console.warn('Date formatting error:', error, 'for date:', dateString)
      return 'Invalid date'
    }
  }

  try {
    // Safe fallbacks for data
    const safeRecords = records || []

    // Convert filter values to match data format
    const distance = selectedDistance ? parseInt(selectedDistance) : null
    const stroke = selectedStroke || null
    const poolType = selectedPoolType?.includes('LC') ? 'LC' : selectedPoolType?.includes('SC') ? 'SC' : null

    // Filter records based on selected criteria
    const filteredRecords = safeRecords.filter(record => {
      if (distance && record.distance !== distance) return false
      if (stroke && record.stroke !== stroke) return false
      if (poolType && record.poolType !== poolType) return false
      return true
    })

  // Sort by date to get most recent records (with safe date handling)
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const dateA = new Date(a.date || '1970-01-01')
    const dateB = new Date(b.date || '1970-01-01')
    
    // Handle invalid dates by putting them at the end
    const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime()
    const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime()
    
    return timeB - timeA
  })

  // Find personal best for this event using PersonalBestCards data (more reliable dates)
  const personalBest = personalBestCards.find(pb => {
    // Check distance match
    const distanceMatch = pb.distance === distance
    
    // Check stroke match (case-insensitive)
    const strokeMatch = pb.stroke?.toLowerCase() === stroke?.toLowerCase()
    
    // Check pool type match with more flexible logic
    let poolTypeMatch = true // Default to true if no poolType filter
    if (poolType) {
      // Handle different pool type representations
      const pbPoolType = pb.primary_best.pool_type
      if (poolType === 'LC') {
        poolTypeMatch = pbPoolType === 'LC' || pbPoolType === 'Long Course'
      } else if (poolType === 'SC') {
        poolTypeMatch = pbPoolType === 'SC' || pbPoolType === 'Short Course'
      } else {
        poolTypeMatch = pbPoolType === poolType
      }
    }
    
    return distanceMatch && strokeMatch && poolTypeMatch
  })

  if (sortedRecords.length === 0) {
    return (
      <Box maxW="600px" mx="auto">
        <Card 
          variant="glass"
          borderRadius="2xl" 
          p={6}
          shadow="lg"
          bgGradient="linear(135deg, seafoam.50 0%, turquoise.100 50%, tropical.50 100%)"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="seafoam.200"
          _hover={{
            transform: "scale(1.02)",
            shadow: "xl",
            bgGradient: "linear(135deg, seafoam.100 0%, turquoise.200 50%, tropical.100 100%)"
          }}
          transition="all 0.3s ease"
        >
          <VStack spacing={5} align="center">
            <Icon as={TimeIcon} color="turquoise.400" boxSize={14} />
            <Heading size="lg" color="tropical.600" textAlign="center" fontWeight="700" letterSpacing="-0.02em">
              🏊‍♀️ Ready to Dive In?
            </Heading>
            <Text fontSize="lg" color="seafoam.600" textAlign="center" maxW="80%">
              {!distance || !stroke 
                ? "🌊 Pick an event from the chart above and let's see how you've been making waves! 🌟"
                : `🐠 Looks like we haven't found any races for ${distance}m ${stroke}${poolType ? ` (${poolType})` : ''} yet. Time to make a splash! 🚀`
              }
            </Text>
          </VStack>
        </Card>
      </Box>
    )
  }

  const mostRecent = sortedRecords[0]
  const previous = sortedRecords.length > 1 ? sortedRecords[1] : null

  // Helper function to get trend display
  const getTrendDisplay = (current: number, comparison: number) => {
    if (!isFinite(current) || !isFinite(comparison) || isNaN(current) || isNaN(comparison)) {
      return {
        icon: MinusIcon,
        color: 'gray.500',
        label: 'No data',
        bgColor: 'gray.50'
      }
    }
    
    const timeDifference = current - comparison
    const isImprovement = timeDifference < 0
    
    if (Math.abs(timeDifference) < 0.05) {
      return {
        icon: MinusIcon,
        color: 'seafoam.500',
        label: '🌊 Steady as she goes!',
        bgColor: 'seafoam.50'
      }
    } else if (isImprovement) {
      return {
        icon: ChevronUpIcon,
        color: 'turquoise.500',
        label: '🚀 Swimming faster!',
        bgColor: 'turquoise.50'
      }
    } else {
      return {
        icon: ChevronDownIcon,
        color: 'coral.500',
        label: '🐠 Room to improve!',
        bgColor: 'coral.50'
      }
    }
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) {
      return 'N/A'
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 
      ? `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`
      : remainingSeconds.toFixed(2)
  }

  const formatTimeDifference = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) {
      return '0.00s'
    }
    const absSeconds = Math.abs(seconds)
    if (absSeconds < 1) {
      return `${(absSeconds * 100).toFixed(0)}cs`
    } else {
      return `${absSeconds.toFixed(2)}s`
    }
  }

  // Calculate improvements with safe fallbacks
  const previousComparison = (previous && mostRecent) ? getTrendDisplay(mostRecent.timeInSeconds, previous.timeInSeconds) : null
  const pbComparison = (personalBest && mostRecent) ? getTrendDisplay(mostRecent.timeInSeconds, personalBest.primary_best.time_seconds) : null
  
  const previousTimeDiff = previous ? mostRecent.timeInSeconds - previous.timeInSeconds : 0
  const pbTimeDiff = personalBest ? mostRecent.timeInSeconds - personalBest.primary_best.time_seconds : 0

  return (
    <Box maxW="1000px" mx="auto">
      {/* Header: event summary and badges */}
      <Stack direction={["column", "row"]} align="center" justify="space-between" mb={4}>
        <HStack spacing={4} align="center">
          <Heading size="md" color="gray.700">{distance ? `${distance}m` : ''} {stroke || ''}</Heading>
          {poolType && (
            <Badge colorScheme={poolType === 'LC' ? 'turquoise' : 'coral'} borderRadius="full" px={3} py={1}>
              {poolType === 'LC' ? 'Long Course' : poolType === 'SC' ? 'Short Course' : poolType}
            </Badge>
          )}
        </HStack>
        <HStack spacing={2}>
          <Badge data-animated="entrance" variant="subtle" colorScheme="turquoise">Recent</Badge>
          <Badge data-animated="entrance" variant="subtle" colorScheme="seafoam">Previous</Badge>
          <Badge data-animated="entrance" variant="subtle" colorScheme="coral">Personal Best</Badge>
        </HStack>
      </Stack>
      {/* Side by side layout when both comparisons exist */}
      {previous && personalBest ? (
        <Stack direction={["column", "row"]} spacing={6} align="stretch">
          {/* Recent vs Previous Race */}
          <Card 
            variant="glass"
            borderRadius="2xl" 
            p={6}
            shadow="xl"
            flex={1}
            bgGradient="linear(135deg, turquoise.50 0%, tropical.100 50%, seafoam.50 100%)"
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor="turquoise.200"
            _hover={{
              transform: "scale(1.02)",
              shadow: "2xl",
              bgGradient: "linear(135deg, turquoise.100 0%, tropical.200 50%, seafoam.100 100%)"
            }}
            transition="all 0.3s ease"
          >
            <VStack spacing={5}>
              <HStack spacing={3} align="center">
                <Icon as={TimeIcon} color="tropical.500" boxSize={5} />
                <Heading size="md" color="tropical.700" fontWeight="700" letterSpacing="-0.02em">
                  🏊‍♀️ Race vs Previous Splash
                </Heading>
              </HStack>

              {/* Compact Time Comparison */}
              <HStack spacing={5} w="full" justify="center" align="center">
                <VStack spacing={1} align="center">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Previous</Text>
                  <Text data-animated="entrance" fontSize={["2xl","3xl"]} fontWeight="800" color="gray.800">{previous.time}</Text>
                  <Text fontSize="sm" color="gray.500">{formatSafeDate(previous.date)}</Text>
                </VStack>

                <Box
                  as="div"
                  position="relative"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w={12}
                  h={12}
                  borderRadius="full"
                  bgGradient={
                    previousComparison?.icon === ChevronUpIcon 
                      ? "linear(135deg, turquoise.400, seafoam.300)"
                      : previousComparison?.icon === ChevronDownIcon
                      ? "linear(135deg, coral.400, orange.300)"
                      : "linear(135deg, gray.400, gray.300)"
                  }
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor={previousComparison?.color || 'gray.400'}
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
                  _hover={{
                    transform: "scale(1.1)",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)"
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon 
                    as={previousComparison?.icon || MinusIcon} 
                    color="white"
                    boxSize={6}
                    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
                  />
                </Box>

                <VStack spacing={1} align="center">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Recent</Text>
                  <Text data-animated="entrance" fontSize={["2xl","3xl"]} fontWeight="800" color="turquoise.600">{mostRecent.time}</Text>
                  <Text fontSize="sm" color="gray.500">{formatSafeDate(mostRecent.date)}</Text>
                </VStack>
              </HStack>

              {/* Compact Analysis */}
              {previousComparison && (
                <VStack spacing={1} align="center" w="full" pt={2}>
                  <HStack align="center" spacing={2}>
                    <Text fontSize="lg" fontWeight="700" color={previousComparison.color}>
                      {previousTimeDiff < 0 ? 'Faster' : previousTimeDiff > 0 ? 'Slower' : 'Same'} by {formatTimeDifference(Math.abs(previousTimeDiff))}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    {Math.abs((previousTimeDiff / previous.timeInSeconds) * 100).toFixed(2)}% {previousTimeDiff < 0 ? 'improvement' : 'slower'}
                  </Text>
                </VStack>
              )}
            </VStack>
          </Card>

          {/* Recent vs Personal Best */}
          <Card 
            variant="glass"
            borderRadius="2xl" 
            p={6}
            shadow="xl"
            flex={1}
            bgGradient="linear(135deg, coral.50 0%, orange.100 50%, yellow.50 100%)"
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor="coral.200"
            _hover={{
              transform: "scale(1.02)",
              shadow: "2xl",
              bgGradient: "linear(135deg, coral.100 0%, orange.200 50%, yellow.100 100%)"
            }}
            transition="all 0.3s ease"
          >
            <VStack spacing={5}>
              <HStack spacing={3} align="center">
                <Icon as={TimeIcon} color="coral.500" boxSize={5} />
                <Heading size="md" color="coral.700" fontWeight="700" letterSpacing="-0.02em">
                  🏆 Chasing Your Personal Best
                </Heading>
              </HStack>

              {/* Compact Time Comparison */}
              <HStack spacing={5} w="full" justify="center" align="center">
                <VStack spacing={1} align="center">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">PB</Text>
                  <Text data-animated="entrance" fontSize={["2xl","3xl"]} fontWeight="800" color="coral.600">{formatTime(personalBest.primary_best.time_seconds)}</Text>
                  <Text fontSize="sm" color="gray.500">{formatSafeDate(personalBest.primary_best.date)}</Text>
                </VStack>

                <Box
                  as="div"
                  position="relative"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w={12}
                  h={12}
                  borderRadius="full"
                  bgGradient={
                    pbComparison?.icon === ChevronUpIcon 
                      ? "linear(135deg, coral.400, orange.300)"
                      : pbComparison?.icon === ChevronDownIcon
                      ? "linear(135deg, red.400, pink.300)"
                      : "linear(135deg, gray.400, gray.300)"
                  }
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor={pbComparison?.color || 'gray.400'}
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
                  _hover={{
                    transform: "scale(1.1)",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)"
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon 
                    as={pbComparison?.icon || MinusIcon} 
                    color="white"
                    boxSize={6}
                    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
                  />
                </Box>

                <VStack spacing={1} align="center">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Recent</Text>
                  <Text data-animated="entrance" fontSize="3xl" fontWeight="bold" color="turquoise.600">{mostRecent.time}</Text>
                  <Text fontSize="sm" color="gray.500">{formatSafeDate(mostRecent.date)}</Text>
                </VStack>
              </HStack>

              {/* Compact Analysis */}
              {pbComparison && (
                <VStack spacing={1} align="center" w="full" pt={2}>
                  <HStack align="center" spacing={2}>
                    <Text fontSize="lg" fontWeight="700" color={pbComparison.color}>
                      {pbTimeDiff < 0 ? 'New PB!' : pbTimeDiff > 0 ? 'Off PB' : 'Tied PB'} 
                      {pbTimeDiff !== 0 && ` by ${formatTimeDifference(Math.abs(pbTimeDiff))}`}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    {pbTimeDiff < 0 
                      ? `${Math.abs((pbTimeDiff / personalBest.primary_best.time_seconds) * 100).toFixed(2)}% improvement`
                      : pbTimeDiff > 0
                      ? `${Math.abs((pbTimeDiff / personalBest.primary_best.time_seconds) * 100).toFixed(2)}% off PB`
                      : 'Tied PB!'
                    }
                  </Text>
                </VStack>
              )}
            </VStack>
          </Card>
  </Stack>
      ) : (
  <VStack spacing={4} align="stretch" maxW={["100%","600px"]} mx="auto">
          {/* Single comparison when only one exists */}
          {previous && !personalBest && (
            <Card 
              variant="glass"
              borderRadius="2xl" 
              p={6}
              shadow="xl"
              bgGradient="linear(135deg, turquoise.50 0%, tropical.100 50%, seafoam.50 100%)"
              backdropFilter="blur(20px)"
              border="1px solid"
              borderColor="turquoise.200"
              _hover={{
                transform: "scale(1.02)",
                shadow: "2xl",
                bgGradient: "linear(135deg, turquoise.100 0%, tropical.200 50%, seafoam.100 100%)"
              }}
              transition="all 0.3s ease"
            >
              <VStack spacing={5}>
                <HStack spacing={3} align="center">
                  <Icon as={TimeIcon} color="tropical.500" boxSize={5} />
                  <Heading size="md" color="tropical.700" fontWeight="700" letterSpacing="-0.02em">
                    🏊‍♀️ Race vs Previous Splash
                  </Heading>
                </HStack>

                <HStack spacing={5} w="full" justify="center" align="center">
                  <VStack spacing={1} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="600">Previous</Text>
                    <Text fontSize={["2xl","3xl"]} fontWeight="800" color="gray.800">{previous.time}</Text>
                    <Text fontSize="sm" color="gray.500">{formatSafeDate(previous.date)}</Text>
                  </VStack>

                  <Box
                    as="div"
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w={12}
                    h={12}
                    borderRadius="full"
                    bgGradient={
                      previousComparison?.icon === ChevronUpIcon 
                        ? "linear(135deg, turquoise.400, seafoam.300)"
                        : previousComparison?.icon === ChevronDownIcon
                        ? "linear(135deg, coral.400, orange.300)"
                        : "linear(135deg, gray.400, gray.300)"
                    }
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor={previousComparison?.color || 'gray.400'}
                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
                    _hover={{
                      transform: "scale(1.1)",
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)"
                    }}
                    transition="all 0.3s ease"
                  >
                    <Icon 
                      as={previousComparison?.icon || MinusIcon} 
                      color="white"
                      boxSize={6}
                      filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
                    />
                  </Box>

                  <VStack spacing={1} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="600">Recent</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="turquoise.600">{mostRecent.time}</Text>
                    <Text fontSize="sm" color="gray.500">{formatSafeDate(mostRecent.date)}</Text>
                  </VStack>
                </HStack>

                {previousComparison && (
                  <VStack spacing={1} align="center" w="full" pt={2}>
                    <Text fontSize="lg" fontWeight="800" color={previousComparison.color}>
                      {previousTimeDiff < 0 ? 'Faster' : previousTimeDiff > 0 ? 'Slower' : 'Same'} by {formatTimeDifference(Math.abs(previousTimeDiff))}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {Math.abs((previousTimeDiff / previous.timeInSeconds) * 100).toFixed(2)}% {previousTimeDiff < 0 ? 'improvement' : 'slower'}
                    </Text>
                  </VStack>
                )}

                {/* Helpful suggestion when PB exists for other pool types */}
                {personalBestCards.length > 0 && distance && stroke && (
                  (() => {
                    const alternativePBs = personalBestCards.filter(pb => 
                      pb.distance === distance && 
                      pb.stroke?.toLowerCase() === stroke?.toLowerCase() &&
                      pb.primary_best.pool_type !== poolType
                    )
                    
                    if (alternativePBs.length > 0) {
                      return (
                        <VStack spacing={2} align="center" mt={4} p={4} bg="coral.50" borderRadius="lg" borderWidth="1px" borderColor="coral.100">
                          <Text fontSize="sm" color="coral.700" fontWeight="600">
                            💡 Personal Best Available
                          </Text>
                          <Text fontSize="sm" color="coral.600" textAlign="center">
                            A PB for {alternativePBs.map(pb => `(${pb.primary_best.pool_type})`).join(', ')} exists. Try changing the pool type to compare.
                          </Text>
                        </VStack>
                      )
                    }
                    return null
                  })()
                )}
              </VStack>
            </Card>
          )}

          {personalBest && !previous && (
            <Card 
              variant="glass"
              borderRadius="2xl" 
              p={6}
              shadow="xl"
              bgGradient="linear(135deg, coral.50 0%, orange.100 50%, yellow.50 100%)"
              backdropFilter="blur(20px)"
              border="1px solid"
              borderColor="coral.200"
              _hover={{
                transform: "scale(1.02)",
                shadow: "2xl",
                bgGradient: "linear(135deg, coral.100 0%, orange.200 50%, yellow.100 100%)"
              }}
              transition="all 0.3s ease"
            >
              <VStack spacing={5}>
                <HStack spacing={3} align="center">
                  <Icon as={TimeIcon} color="coral.500" boxSize={5} />
                  <Heading size="md" color="coral.700" fontWeight="700" letterSpacing="-0.02em">
                    🏆 Chasing Your Personal Best
                  </Heading>
                </HStack>

                <HStack spacing={5} w="full" justify="center" align="center">
                  <VStack spacing={1} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="600">Personal Best</Text>
                    <Text fontSize={["2xl","3xl"]} fontWeight="800" color="coral.600">{formatTime(personalBest.primary_best.time_seconds)}</Text>
                    <Text fontSize="sm" color="gray.500">{formatSafeDate(personalBest.primary_best.date)}</Text>
                  </VStack>

                  <Box
                    as="div"
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w={12}
                    h={12}
                    borderRadius="full"
                    bgGradient={
                      pbComparison?.icon === ChevronUpIcon 
                        ? "linear(135deg, coral.400, orange.300)"
                        : pbComparison?.icon === ChevronDownIcon
                        ? "linear(135deg, red.400, pink.300)"
                        : "linear(135deg, gray.400, gray.300)"
                    }
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor={pbComparison?.color || 'gray.400'}
                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
                    _hover={{
                      transform: "scale(1.1)",
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)"
                    }}
                    transition="all 0.3s ease"
                  >
                    <Icon 
                      as={pbComparison?.icon || MinusIcon} 
                      color="white"
                      boxSize={6}
                      filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
                    />
                  </Box>

                  <VStack spacing={1} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="600">Recent</Text>
                    <Text fontSize={["2xl","3xl"]} fontWeight="900" color="turquoise.600">{mostRecent.time}</Text>
                    <Text fontSize="sm" color="gray.500">{formatSafeDate(mostRecent.date)}</Text>
                  </VStack>
                </HStack>

                {pbComparison && (
                  <VStack spacing={1} align="center" w="full" pt={2}>
                    <Text fontSize="lg" fontWeight="700" color={pbComparison.color}>
                      {pbTimeDiff < 0 ? 'New Personal Best!' : pbTimeDiff > 0 ? 'Off PB' : 'Tied PB'} 
                      {pbTimeDiff !== 0 && ` by ${formatTimeDifference(Math.abs(pbTimeDiff))}`}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {pbTimeDiff < 0 
                        ? `${Math.abs((pbTimeDiff / personalBest.primary_best.time_seconds) * 100).toFixed(2)}% improvement`
                        : pbTimeDiff > 0
                        ? `${Math.abs((pbTimeDiff / personalBest.primary_best.time_seconds) * 100).toFixed(2)}% off personal best`
                        : 'Tied your personal best!'
                      }
                    </Text>
                  </VStack>
                )}
              </VStack>
            </Card>
          )}

          {/* Single Race Card */}
          {!previous && !personalBest && (
            <Card 
              variant="glass"
              borderRadius="2xl" 
              p={6}
              shadow="xl"
              bgGradient="linear(135deg, seafoam.50 0%, turquoise.100 50%, tropical.50 100%)"
              backdropFilter="blur(20px)"
              border="1px solid"
              borderColor="seafoam.200"
              _hover={{
                transform: "scale(1.02)",
                shadow: "2xl",
                bgGradient: "linear(135deg, seafoam.100 0%, turquoise.200 50%, tropical.100 100%)"
              }}
              transition="all 0.3s ease"
            >
              <VStack spacing={4}>
                <HStack spacing={3} align="center">
                  <Icon as={TimeIcon} color="turquoise.500" boxSize={5} />
                  <Heading size="md" color="turquoise.700" fontWeight="700" letterSpacing="-0.02em">
                    🌊 Recent Performance
                  </Heading>
                </HStack>

                <VStack spacing={2} align="center" pt={2}>
                  <Text fontSize="5xl" fontWeight="bold" color="turquoise.600" lineHeight="1.2">
                    {mostRecent.time}
                  </Text>
                  <Text fontSize="xl" fontWeight="600" color="gray.700">
                    {distance}m {stroke}
                  </Text>
                  <Text fontSize="md" color="gray.500">
                    {formatSafeDate(mostRecent.date)}
                  </Text>
                  {mostRecent.isPersonalBest && (
                    <HStack bg="seafoam.100" px={3} py={1} borderRadius="full" mt={2}>
                      <Text fontSize="sm" color="seafoam.800" fontWeight="700">
                        🏆 New Personal Best!
                      </Text>
                    </HStack>
                  )}
                </VStack>

                {/* Helpful suggestion when PB exists for other pool types */}
                {personalBestCards.length > 0 && distance && stroke && (
                  (() => {
                    const alternativePBs = personalBestCards.filter(pb => 
                      pb.distance === distance && 
                      pb.stroke?.toLowerCase() === stroke?.toLowerCase() &&
                      pb.primary_best.pool_type !== poolType
                    )
                    
                    if (alternativePBs.length > 0) {
                      return (
                        <HStack spacing={3} align="center" mt={4} p={3} bg="coral.50" borderRadius="lg" borderWidth="1px" borderColor="coral.100">
                          <Icon as={TimeIcon} color="coral.400" boxSize={5} />
                          <VStack spacing={0} align="start">
                            <Text fontSize="sm" color="coral.700" fontWeight="700">💡 Personal Best Available</Text>
                            <Text fontSize="xs" color="coral.600">A PB for {alternativePBs.map(pb => `(${pb.primary_best.pool_type})`).join(', ')} exists. Try changing the pool type.</Text>
                          </VStack>
                        </HStack>
                      )
                    }
                    return null
                  })()
                )}
              </VStack>
            </Card>
          )}
        </VStack>
      )}

      {/* Event Info Footer */}
      <HStack spacing={1} align="center" justify="center" color="gray.500" fontSize="xs" mt={3}>
        <Icon as={TimeIcon} boxSize={3} />
        <Text>{distance}m {stroke} • {mostRecent.poolType}</Text>
      </HStack>
    </Box>
  )
  } catch (error) {
    console.error('Error in RecentPerformanceComparison:', error)
    return (
      <Box maxW="600px" mx="auto">
        <Card 
          variant="glass"
          borderRadius="2xl" 
          p={8}
          shadow="lg"
          bgGradient="linear(135deg, red.50 0%, pink.100 50%, orange.50 100%)"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor="red.200"
        >
          <VStack spacing={4} align="center">
            <Icon as={TimeIcon} color="red.300" boxSize={12} />
            <Heading size="md" color="red.600" textAlign="center">
              Recent Performance Comparison
            </Heading>
            <Text color="red.600" textAlign="center">
              Error loading performance comparison
            </Text>
          </VStack>
        </Card>
      </Box>
    )
  }
}