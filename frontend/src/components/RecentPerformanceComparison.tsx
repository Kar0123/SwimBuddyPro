import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading
} from '@chakra-ui/react'
import { ChevronUpIcon, ChevronDownIcon, MinusIcon, StarIcon, TimeIcon } from '@chakra-ui/icons'
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
    const cardBg = useColorModeValue('white', 'gray.700')
    const statBg = useColorModeValue('gray.50', 'gray.600')
    const borderColor = useColorModeValue('gray.200', 'gray.600')
    const accentColor = useColorModeValue('primary.500', 'primary.300')

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
      <VStack spacing={4} align="stretch">
        <Text fontSize="sm" color="gray.500" textAlign="center">
          {!distance || !stroke 
            ? "Select an event in the Performance Chart to see comparison"
            : `No races found for ${distance}m ${stroke}${poolType ? ` (${poolType})` : ''}`
          }
        </Text>
      </VStack>
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
    <VStack spacing={6} align="stretch">
      {/* Event Header */}
      <Box textAlign="center" py={2}>
        <Text fontSize="lg" fontWeight="bold" color={accentColor}>
          {distance}m {stroke}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Performance Analysis {poolType && `• ${poolType} Pool`}
        </Text>
      </Box>

      <SimpleGrid columns={1} spacing={6}>
        {/* Most Recent vs Previous Race Card */}
        {previous && (
          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardHeader pb={2}>
              <HStack justify="space-between">
                <Heading size="sm" color="primary.600">
                  <Icon as={TimeIcon} mr={2} />
                  Recent vs Previous Race
                </Heading>
                <Badge colorScheme="blue" variant="subtle">
                  Race Comparison
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4}>
                {/* Time Comparison */}
                <HStack spacing={4} align="stretch" w="full">
                  {/* Most Recent */}
                  <Box flex={1} p={3} bg="primary.50" borderRadius="md" borderWidth={2} borderColor="primary.200" position="relative">
                    <Badge position="absolute" top={1} right={1} colorScheme="primary" size="xs">
                      {mostRecent.poolType}
                    </Badge>
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="gray.600" fontWeight="bold">MOST RECENT</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                        {mostRecent.time}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(mostRecent.date).toLocaleDateString()}
                      </Text>
                      <Text fontSize="xs" color="gray.600" textAlign="center" noOfLines={2}>
                        {mostRecent.meet}
                      </Text>
                      {mostRecent.isPersonalBest && (
                        <Badge colorScheme="green" size="sm">🏆 PB!</Badge>
                      )}
                    </VStack>
                  </Box>

                  {/* vs */}
                  <Flex align="center" px={2}>
                    <Text fontSize="sm" color="gray.400" fontWeight="bold">vs</Text>
                  </Flex>

                  {/* Previous */}
                  <Box flex={1} p={3} bg={statBg} borderRadius="md" borderWidth={1} borderColor={borderColor} position="relative">
                    <Badge position="absolute" top={1} right={1} colorScheme="gray" size="xs">
                      {previous.poolType}
                    </Badge>
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="gray.600" fontWeight="bold">PREVIOUS</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="gray.600">
                        {previous.time}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(previous.date).toLocaleDateString()}
                      </Text>
                      <Text fontSize="xs" color="gray.600" textAlign="center" noOfLines={2}>
                        {previous.meet}
                      </Text>
                      {previous.isPersonalBest && (
                        <Badge colorScheme="gray" size="sm">Was PB</Badge>
                      )}
                    </VStack>
                  </Box>
                </HStack>

                {/* Analysis */}
                {previousComparison && (
                  <Box p={3} bg={previousComparison.bgColor} borderRadius="md" borderWidth={1} borderColor={previousComparison.color} w="full">
                    <HStack spacing={3} align="center">
                      <Icon as={previousComparison.icon} color={previousComparison.color} boxSize={5} />
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                          <Text fontSize="sm" fontWeight="bold" color={previousComparison.color}>
                            {previousComparison.label}
                          </Text>
                          <Badge colorScheme={previousTimeDiff < 0 ? 'green' : previousTimeDiff > 0 ? 'red' : 'gray'} size="sm">
                            {previousTimeDiff < 0 ? '-' : '+'}{formatTimeDifference(previousTimeDiff)}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.600">
                          {Math.abs((previousTimeDiff / previous.timeInSeconds) * 100).toFixed(2)}% change from previous race
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={0}>
                        <Text fontSize="xs" color="gray.500">WA Points</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {mostRecent.waPoints} → {previous.waPoints}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Most Recent vs Personal Best Card */}
        {personalBest && (
          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardHeader pb={2}>
              <HStack justify="space-between">
                <Heading size="sm" color="orange.600">
                  <Icon as={StarIcon} mr={2} />
                  Recent vs Personal Best
                </Heading>
                <Badge colorScheme="orange" variant="subtle">
                  PB Comparison
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4}>
                {/* Time Comparison */}
                <HStack spacing={4} align="stretch" w="full">
                  {/* Most Recent */}
                  <Box flex={1} p={3} bg="primary.50" borderRadius="md" borderWidth={2} borderColor="primary.200" position="relative">
                    <Badge position="absolute" top={1} right={1} colorScheme="primary" size="xs">
                      {mostRecent.poolType}
                    </Badge>
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="gray.600" fontWeight="bold">MOST RECENT</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                        {mostRecent.time}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(mostRecent.date).toLocaleDateString()}
                      </Text>
                      <Text fontSize="xs" color="gray.600" textAlign="center" noOfLines={2}>
                        {mostRecent.meet}
                      </Text>
                    </VStack>
                  </Box>

                  {/* vs */}
                  <Flex align="center" px={2}>
                    <Text fontSize="sm" color="gray.400" fontWeight="bold">vs</Text>
                  </Flex>

                  {/* Personal Best */}
                  <Box flex={1} p={3} bg="orange.50" borderRadius="md" borderWidth={2} borderColor="orange.200" position="relative">
                    <Badge position="absolute" top={1} right={1} colorScheme="orange" size="xs">
                      {personalBest.poolType}
                    </Badge>
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="gray.600" fontWeight="bold">PERSONAL BEST</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        {personalBest.bestTime}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(personalBest.date).toLocaleDateString()}
                      </Text>
                      <Text fontSize="xs" color="gray.600" textAlign="center" noOfLines={2}>
                        {personalBest.meet}
                      </Text>
                      <Badge colorScheme="orange" size="sm">🥇 All-Time Best</Badge>
                    </VStack>
                  </Box>
                </HStack>

                {/* Analysis */}
                {pbComparison && (
                  <Box p={3} bg={pbComparison.bgColor} borderRadius="md" borderWidth={1} borderColor={pbComparison.color} w="full">
                    <HStack spacing={3} align="center">
                      <Icon as={pbComparison.icon} color={pbComparison.color} boxSize={5} />
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                          <Text fontSize="sm" fontWeight="bold" color={pbComparison.color}>
                            {pbTimeDiff < 0 ? 'New Personal Best!' : pbComparison.label}
                          </Text>
                          <Badge colorScheme={pbTimeDiff < 0 ? 'green' : pbTimeDiff > 0 ? 'red' : 'gray'} size="sm">
                            {pbTimeDiff < 0 ? '-' : '+'}{formatTimeDifference(pbTimeDiff)}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.600">
                          {pbTimeDiff < 0 
                            ? `New PB by ${Math.abs((pbTimeDiff / personalBest.bestTimeSeconds) * 100).toFixed(2)}%`
                            : `${Math.abs((pbTimeDiff / personalBest.bestTimeSeconds) * 100).toFixed(2)}% off personal best`
                          }
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={0}>
                        <Text fontSize="xs" color="gray.500">WA Points</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {mostRecent.waPoints} → {personalBest.waPoints}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* No comparison data available */}
        {!previous && !personalBest && (
          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardBody textAlign="center" py={8}>
              <VStack spacing={3}>
                <Text fontSize="lg" fontWeight="bold" color="primary.600">
                  {mostRecent.time}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {distance}m {stroke} ({mostRecent.poolType})
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {new Date(mostRecent.date).toLocaleDateString()} • {mostRecent.meet}
                </Text>
                <Badge colorScheme="blue" size="sm">
                  Only race for this event
                </Badge>
              </VStack>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>
    </VStack>
  )
  } catch (error) {
    console.error('Error in RecentPerformanceComparison:', error)
    return (
      <Card bg="red.50" borderColor="red.200" borderWidth="1px">
        <CardBody>
          <Text color="red.600">Error loading performance comparison</Text>
        </CardBody>
      </Card>
    )
  }
}