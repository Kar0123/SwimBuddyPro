import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Card,
  Heading,
  Flex
} from '@chakra-ui/react'
import { ChevronUpIcon, ChevronDownIcon, MinusIcon, TimeIcon } from '@chakra-ui/icons'
import type { SwimRecord, PersonalBest } from '../services/api'

interface RecentPerformanceComparisonProps {
  records: SwimRecord[]
  personalBests: PersonalBest[]
  selectedDistance?: string
  selectedStroke?: string
  selectedPoolType?: string
}

export const RecentPerformanceComparison = ({
  records,
  personalBests,
  selectedDistance,
  selectedStroke,
  selectedPoolType
}: RecentPerformanceComparisonProps) => {
  try {
    // Safe fallbacks for data
    const safeRecords = records || []
    const safePersonalBests = personalBests || []

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

  // Sort by date to get most recent records
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Find personal best for this event
  const personalBest = safePersonalBests.find(pb => {
    return pb.distance === distance && 
           pb.stroke === stroke &&
           (poolType ? pb.poolType === poolType : true)
  })

  if (sortedRecords.length === 0) {
    return (
      <Box maxW="600px" mx="auto">
        <Card 
          bg="linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)" 
          borderRadius="2xl" 
          p={8}
          shadow="lg"
          borderWidth="1px"
          borderColor="blue.100"
        >
          <VStack spacing={4} align="center">
            <Icon as={TimeIcon} color="blue.300" boxSize={12} />
            <Heading size="md" color="blue.600" textAlign="center">
              Recent Performance Comparison
            </Heading>
            <Text fontSize="md" color="gray.500" textAlign="center">
              {!distance || !stroke 
                ? "Select an event in the Performance Chart to see comparison"
                : `No races found for ${distance}m ${stroke}${poolType ? ` (${poolType})` : ''}`
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
        color: 'gray.500',
        label: 'Stable',
        bgColor: 'gray.50'
      }
    } else if (isImprovement) {
      return {
        icon: ChevronUpIcon,
        color: 'green.500',
        label: 'Improved',
        bgColor: 'green.50'
      }
    } else {
      return {
        icon: ChevronDownIcon,
        color: 'red.500',
        label: 'Slower',
        bgColor: 'red.50'
      }
    }
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
  const pbComparison = (personalBest && mostRecent) ? getTrendDisplay(mostRecent.timeInSeconds, personalBest.bestTimeSeconds) : null
  
  const previousTimeDiff = previous ? mostRecent.timeInSeconds - previous.timeInSeconds : 0
  const pbTimeDiff = personalBest ? mostRecent.timeInSeconds - personalBest.bestTimeSeconds : 0

  return (
    <Box maxW="1000px" mx="auto">
      {/* Side by side layout when both comparisons exist */}
      {previous && personalBest ? (
        <HStack spacing={6} align="stretch">
          {/* Recent vs Previous Race */}
          <Card 
            bg="linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)" 
            borderRadius="xl" 
            p={4}
            shadow="md"
            borderWidth="1px"
            borderColor="blue.100"
            flex={1}
          >
            <VStack spacing={4}>
              <HStack spacing={2} align="center">
                <Icon as={TimeIcon} color="blue.500" boxSize={4} />
                <Heading size="sm" color="blue.600" fontWeight="600">
                  vs Previous Race
                </Heading>
              </HStack>

              {/* Compact Time Comparison */}
              <HStack spacing={4} w="full" justify="center" align="center">
                <VStack spacing={1} align="center">
                  <Text fontSize="xs" color="gray.600" fontWeight="500">Previous</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.700">{previous.time}</Text>
                  <Text fontSize="xs" color="gray.500">{new Date(previous.date).toLocaleDateString()}</Text>
                </VStack>

                <Icon 
                  as={previousComparison?.icon || MinusIcon} 
                  color={previousComparison?.color || 'gray.400'}
                  boxSize={6}
                />

                <VStack spacing={1} align="center">
                  <Text fontSize="xs" color="gray.600" fontWeight="500">Recent</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">{mostRecent.time}</Text>
                  <Text fontSize="xs" color="gray.500">{new Date(mostRecent.date).toLocaleDateString()}</Text>
                </VStack>
              </HStack>

              {/* Compact Analysis */}
              {previousComparison && (
                <VStack spacing={1} align="center" w="full">
                  <HStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="600" color={previousComparison.color}>
                      {previousTimeDiff < 0 ? 'Faster' : previousTimeDiff > 0 ? 'Slower' : 'Same'} by {formatTimeDifference(Math.abs(previousTimeDiff))}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    {Math.abs((previousTimeDiff / previous.timeInSeconds) * 100).toFixed(2)}% {previousTimeDiff < 0 ? 'improvement' : 'slower'}
                  </Text>
                </VStack>
              )}
            </VStack>
          </Card>

          {/* Recent vs Personal Best */}
          <Card 
            bg="linear-gradient(135deg, #fff8f0 0%, #fff0e6 100%)" 
            borderRadius="xl" 
            p={4}
            shadow="md"
            borderWidth="1px"
            borderColor="orange.100"
            flex={1}
          >
            <VStack spacing={4}>
              <HStack spacing={2} align="center">
                <Icon as={TimeIcon} color="orange.500" boxSize={4} />
                <Heading size="sm" color="orange.600" fontWeight="600">
                  vs Personal Best
                </Heading>
              </HStack>

              {/* Compact Time Comparison */}
              <HStack spacing={4} w="full" justify="center" align="center">
                <VStack spacing={1} align="center">
                  <Text fontSize="xs" color="gray.600" fontWeight="500">PB</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.600">{personalBest.bestTime}</Text>
                  <Text fontSize="xs" color="gray.500">{new Date(personalBest.date).toLocaleDateString()}</Text>
                </VStack>

                <Icon 
                  as={pbComparison?.icon || MinusIcon} 
                  color={pbComparison?.color || 'gray.400'}
                  boxSize={6}
                />

                <VStack spacing={1} align="center">
                  <Text fontSize="xs" color="gray.600" fontWeight="500">Recent</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">{mostRecent.time}</Text>
                  <Text fontSize="xs" color="gray.500">{new Date(mostRecent.date).toLocaleDateString()}</Text>
                </VStack>
              </HStack>

              {/* Compact Analysis */}
              {pbComparison && (
                <VStack spacing={1} align="center" w="full">
                  <HStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="600" color={pbComparison.color}>
                      {pbTimeDiff < 0 ? 'New PB!' : pbTimeDiff > 0 ? 'Off PB' : 'Tied PB'} 
                      {pbTimeDiff !== 0 && ` by ${formatTimeDifference(Math.abs(pbTimeDiff))}`}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    {pbTimeDiff < 0 
                      ? `${Math.abs((pbTimeDiff / personalBest.bestTimeSeconds) * 100).toFixed(2)}% improvement`
                      : pbTimeDiff > 0
                      ? `${Math.abs((pbTimeDiff / personalBest.bestTimeSeconds) * 100).toFixed(2)}% off PB`
                      : 'Tied PB!'
                    }
                  </Text>
                </VStack>
              )}
            </VStack>
          </Card>
        </HStack>
      ) : (
        <VStack spacing={4} align="stretch" maxW="600px" mx="auto">
          {/* Single comparison when only one exists */}
          {previous && !personalBest && (
            <Card 
              bg="linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)" 
              borderRadius="xl" 
              p={5}
              shadow="md"
              borderWidth="1px"
              borderColor="blue.100"
            >
              <VStack spacing={4}>
                <HStack spacing={2} align="center">
                  <Icon as={TimeIcon} color="blue.500" boxSize={5} />
                  <Heading size="md" color="blue.600" fontWeight="600">
                    Recent vs Previous Race
                  </Heading>
                </HStack>

                <HStack spacing={6} w="full" justify="center" align="center">
                  <VStack spacing={2} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="500">Previous</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="gray.700">{previous.time}</Text>
                    <Text fontSize="sm" color="gray.500">{new Date(previous.date).toLocaleDateString()}</Text>
                  </VStack>

                  <Icon 
                    as={previousComparison?.icon || MinusIcon} 
                    color={previousComparison?.color || 'gray.400'}
                    boxSize={8}
                  />

                  <VStack spacing={2} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="500">Recent</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">{mostRecent.time}</Text>
                    <Text fontSize="sm" color="gray.500">{new Date(mostRecent.date).toLocaleDateString()}</Text>
                  </VStack>
                </HStack>

                {previousComparison && (
                  <VStack spacing={2} align="center" w="full">
                    <Text fontSize="lg" fontWeight="600" color={previousComparison.color}>
                      {previousTimeDiff < 0 ? 'Faster' : previousTimeDiff > 0 ? 'Slower' : 'Same'} by {formatTimeDifference(Math.abs(previousTimeDiff))}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {Math.abs((previousTimeDiff / previous.timeInSeconds) * 100).toFixed(2)}% {previousTimeDiff < 0 ? 'improvement' : 'slower'}
                    </Text>
                  </VStack>
                )}
              </VStack>
            </Card>
          )}

          {personalBest && !previous && (
            <Card 
              bg="linear-gradient(135deg, #fff8f0 0%, #fff0e6 100%)" 
              borderRadius="xl" 
              p={5}
              shadow="md"
              borderWidth="1px"
              borderColor="orange.100"
            >
              <VStack spacing={4}>
                <HStack spacing={2} align="center">
                  <Icon as={TimeIcon} color="orange.500" boxSize={5} />
                  <Heading size="md" color="orange.600" fontWeight="600">
                    Recent vs Personal Best
                  </Heading>
                </HStack>

                <HStack spacing={6} w="full" justify="center" align="center">
                  <VStack spacing={2} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="500">Personal Best</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="orange.600">{personalBest.bestTime}</Text>
                    <Text fontSize="sm" color="gray.500">{new Date(personalBest.date).toLocaleDateString()}</Text>
                  </VStack>

                  <Icon 
                    as={pbComparison?.icon || MinusIcon} 
                    color={pbComparison?.color || 'gray.400'}
                    boxSize={8}
                  />

                  <VStack spacing={2} align="center">
                    <Text fontSize="sm" color="gray.600" fontWeight="500">Recent</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">{mostRecent.time}</Text>
                    <Text fontSize="sm" color="gray.500">{new Date(mostRecent.date).toLocaleDateString()}</Text>
                  </VStack>
                </HStack>

                {pbComparison && (
                  <VStack spacing={2} align="center" w="full">
                    <Text fontSize="lg" fontWeight="600" color={pbComparison.color}>
                      {pbTimeDiff < 0 ? 'New Personal Best!' : pbTimeDiff > 0 ? 'Off PB' : 'Tied PB'} 
                      {pbTimeDiff !== 0 && ` by ${formatTimeDifference(Math.abs(pbTimeDiff))}`}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {pbTimeDiff < 0 
                        ? `${Math.abs((pbTimeDiff / personalBest.bestTimeSeconds) * 100).toFixed(2)}% improvement`
                        : pbTimeDiff > 0
                        ? `${Math.abs((pbTimeDiff / personalBest.bestTimeSeconds) * 100).toFixed(2)}% off personal best`
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
              bg="linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)" 
              borderRadius="xl" 
              p={6}
              shadow="md"
              borderWidth="1px"
              borderColor="blue.100"
            >
              <VStack spacing={4}>
                <HStack spacing={2} align="center">
                  <Icon as={TimeIcon} color="blue.500" boxSize={5} />
                  <Heading size="md" color="blue.600" fontWeight="600">
                    Recent Performance
                  </Heading>
                </HStack>

                <VStack spacing={3} align="center">
                  <Text fontSize="4xl" fontWeight="bold" color="blue.600">{mostRecent.time}</Text>
                  <Text fontSize="lg" fontWeight="600" color="gray.700">{distance}m {stroke}</Text>
                  <Text fontSize="sm" color="gray.500">{new Date(mostRecent.date).toLocaleDateString()}</Text>
                  {mostRecent.isPersonalBest && (
                    <Text fontSize="sm" color="green.600" fontWeight="600">🏆 Personal Best!</Text>
                  )}
                </VStack>
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
          bg="linear-gradient(135deg, #fff8f8 0%, #fff0f0 100%)" 
          borderRadius="2xl" 
          p={8}
          shadow="lg"
          borderWidth="1px"
          borderColor="red.100"
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