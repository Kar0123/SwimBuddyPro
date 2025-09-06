import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Spacer,
  IconButton,
  useColorModeValue,
  Skeleton,
  SimpleGrid,
  Tooltip
} from '@chakra-ui/react'
import { SearchIcon, DownloadIcon } from '@chakra-ui/icons'
import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { personalBestsCardsApi } from '../services/api'

const MotionCard = motion(Card)

interface PersonalBest {
  event_name: string
  stroke: string
  distance: number
  stroke_color: string
  stroke_icon: string
  primary_best: {
    time: string
    time_seconds: number
    pool_type: string
    date: string
    meet_name: string
    venue: string
    wa_points: number
    round_type: string
  }
  secondary_best?: {
    time: string
    time_seconds: number
    pool_type: string
    date: string
    meet_name: string
    venue: string
    wa_points: number
  }
  improvement: {
    recent_improvement: number
    season_improvement: number
    all_time_improvement: number
    trend: 'improving' | 'declining' | 'stable'
  }
  total_races: number
  seasons_competed: string[]
}

interface PersonalBestsCardsData {
  tiref: string
  swimmer_name: string
  personal_bests: PersonalBest[]
  last_updated: string | null
}

interface PersonalBestsCardsProps {
  tiref: string
}

export const PersonalBestsCards = ({ tiref }: PersonalBestsCardsProps) => {
  const [data, setData] = useState<PersonalBestsCardsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [strokeFilter, setStrokeFilter] = useState('all')
  const [poolTypeFilter, setPoolTypeFilter] = useState('all')

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await personalBestsCardsApi(tiref)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    if (tiref) {
      fetchData()
    }
  }, [tiref])

  // Get unique strokes for filtering
  const strokes = useMemo(() => {
    if (!data) return []
    return [...new Set(data.personal_bests.map(pb => pb.stroke))]
  }, [data])

  // Filter personal bests
  const filteredBests = useMemo(() => {
    if (!data) return []
    
    return data.personal_bests.filter(pb => {
      const matchesSearch = pb.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pb.primary_best.meet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pb.primary_best.venue.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStroke = strokeFilter === 'all' || pb.stroke === strokeFilter
      const matchesPoolType = poolTypeFilter === 'all' || 
                              pb.primary_best.pool_type === poolTypeFilter ||
                              (pb.secondary_best && pb.secondary_best.pool_type === poolTypeFilter)

      return matchesSearch && matchesStroke && matchesPoolType
    })
  }, [data, searchTerm, strokeFilter, poolTypeFilter])

  const formatTime = (timeString: string) => {
    return timeString
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'green'
      case 'declining': return 'red'
      default: return 'gray'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↗️'
      case 'declining': return '↘️'
      default: return '➡️'
    }
  }

  const formatTooltipContent = (pb: PersonalBest) => {
    return (
      <VStack align="start" spacing={3} maxW="280px" p={2}>
        {/* Primary Best Details */}
        <Box>
          <HStack spacing={2} mb={2}>
            <Text fontSize="lg">{pb.stroke_icon}</Text>
            <Text fontWeight="600" fontSize="md" color="white">
              {pb.event_name}
            </Text>
          </HStack>
          <VStack align="start" spacing={1}>
            <HStack>
              <Text fontSize="sm" color="blue.200" fontWeight="500">⏱️ Best Time:</Text>
              <Text fontSize="sm" color="white" fontWeight="600">{pb.primary_best.time}</Text>
              <Badge colorScheme={pb.primary_best.pool_type === 'LC' ? 'blue' : 'green'} size="sm">
                {pb.primary_best.pool_type}
              </Badge>
            </HStack>
            <HStack>
              <Text fontSize="sm" color="blue.200" fontWeight="400">🏆 WA Points:</Text>
              <Text fontSize="sm" color="white" fontWeight="500">{pb.primary_best.wa_points}</Text>
            </HStack>
            <HStack>
              <Text fontSize="sm" color="blue.200" fontWeight="400">📅 Date:</Text>
              <Text fontSize="sm" color="white" fontWeight="400">{formatDate(pb.primary_best.date)}</Text>
            </HStack>
            <HStack>
              <Text fontSize="sm" color="blue.200" fontWeight="400">🏊 Round:</Text>
              <Text fontSize="sm" color="white" fontWeight="400">{pb.primary_best.round_type}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Meet & Venue */}
        <Box>
          <Text fontWeight="600" fontSize="sm" color="yellow.200" mb={1}>
            📍 Competition Details
          </Text>
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="gray.200" noOfLines={2} fontWeight="400">
              <Text as="span" fontWeight="500">Meet:</Text> {pb.primary_best.meet_name}
            </Text>
            <Text fontSize="xs" color="gray.200" noOfLines={1} fontWeight="400">
              <Text as="span" fontWeight="500">Venue:</Text> {pb.primary_best.venue}
            </Text>
          </VStack>
        </Box>

        {/* Secondary Best (if exists) */}
        {pb.secondary_best && (
          <Box>
            <Text fontWeight="600" fontSize="sm" color="green.200" mb={1}>
              🏊 {pb.secondary_best.pool_type} Personal Best
            </Text>
            <VStack align="start" spacing={1}>
              <HStack>
                <Text fontSize="sm" color="white" fontWeight="600">{pb.secondary_best.time}</Text>
                <Text fontSize="xs" color="gray.300" fontWeight="400">({pb.secondary_best.wa_points} WA pts)</Text>
              </HStack>
              <Text fontSize="xs" color="gray.200" fontWeight="400">
                {formatDate(pb.secondary_best.date)}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Performance Stats */}
        <Box>
          <Text fontWeight="600" fontSize="sm" color="purple.200" mb={1}>
            📈 Performance Trends
          </Text>
          <VStack align="start" spacing={1}>
            <HStack>
              <Text fontSize="xs" color="gray.300" fontWeight="400">Recent:</Text>
              <Text fontSize="xs" color={pb.improvement.recent_improvement <= 0 ? 'green.300' : 'red.300'} fontWeight="500">
                {pb.improvement.recent_improvement > 0 ? '+' : ''}{pb.improvement.recent_improvement.toFixed(2)}s
              </Text>
            </HStack>
            <HStack>
              <Text fontSize="xs" color="gray.300" fontWeight="400">Season:</Text>
              <Text fontSize="xs" color={pb.improvement.season_improvement <= 0 ? 'green.300' : 'red.300'} fontWeight="500">
                {pb.improvement.season_improvement > 0 ? '+' : ''}{pb.improvement.season_improvement.toFixed(2)}s
              </Text>
            </HStack>
            <HStack>
              <Text fontSize="xs" color="gray.300" fontWeight="400">All Time:</Text>
              <Text fontSize="xs" color={pb.improvement.all_time_improvement <= 0 ? 'green.300' : 'red.300'} fontWeight="500">
                {pb.improvement.all_time_improvement > 0 ? '+' : ''}{pb.improvement.all_time_improvement.toFixed(2)}s
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Competition History */}
        <Box>
          <Text fontWeight="600" fontSize="sm" color="orange.200" mb={1}>
            🎯 Competition Summary
          </Text>
          <HStack spacing={4}>
            <VStack spacing={0}>
              <Text fontSize="lg" fontWeight="700" color="white">{pb.total_races}</Text>
              <Text fontSize="xs" color="gray.300" fontWeight="400">Total Races</Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="lg" fontWeight="700" color="white">{pb.seasons_competed.length}</Text>
              <Text fontSize="xs" color="gray.300" fontWeight="400">Seasons</Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>
    )
  }

  const exportData = () => {
    if (!data) return
    
    const csvContent = [
      ['Event', 'Best Time', 'Pool Type', 'WA Points', 'Date', 'Meet', 'Venue', 'Total Races', 'Recent Improvement'].join(','),
      ...filteredBests.map(pb => [
        pb.event_name,
        pb.primary_best.time,
        pb.primary_best.pool_type,
        pb.primary_best.wa_points,
        formatDate(pb.primary_best.date),
        pb.primary_best.meet_name,
        pb.primary_best.venue,
        pb.total_races,
        pb.improvement.recent_improvement > 0 ? `+${pb.improvement.recent_improvement.toFixed(2)}s` : `${pb.improvement.recent_improvement.toFixed(2)}s`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.swimmer_name}-personal-bests.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card bg={cardBg}>
        <CardHeader>
          <Skeleton height="24px" width="300px" />
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="200px" borderRadius="md" />
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card bg={cardBg}>
        <CardBody>
          <VStack spacing={4}>
            <Text color="red.500" fontSize="lg">Error loading personal bests</Text>
            <Text color={textColor}>{error}</Text>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
      <CardHeader>
        <VStack spacing={4} align="stretch">
          <Flex align="center">
            <Heading size="md" color="primary.600">
              🏆 Personal Bests Cards - {data.swimmer_name}
            </Heading>
            <Spacer />
            <HStack>
              <Badge colorScheme="primary" variant="subtle">
                {filteredBests.length} events
              </Badge>
              <IconButton
                aria-label="Export data"
                icon={<DownloadIcon />}
                size="sm"
                variant="outline"
                onClick={exportData}
              />
            </HStack>
          </Flex>

          {data.last_updated && (
            <Text fontSize="sm" color={textColor}>
              Last updated: {formatDate(data.last_updated)}
            </Text>
          )}

          {/* Filters */}
          <HStack spacing={4} wrap="wrap">
            <InputGroup size="sm" maxW="250px">
              <InputLeftElement>
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search events, meets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              size="sm"
              value={strokeFilter}
              onChange={(e) => setStrokeFilter(e.target.value)}
              maxW="150px"
            >
              <option value="all">All Strokes</option>
              {strokes.map(stroke => (
                <option key={stroke} value={stroke}>{stroke}</option>
              ))}
            </Select>

            <Select
              size="sm"
              value={poolTypeFilter}
              onChange={(e) => setPoolTypeFilter(e.target.value)}
              maxW="120px"
            >
              <option value="all">All Pools</option>
              <option value="LC">Long Course</option>
              <option value="SC">Short Course</option>
            </Select>
          </HStack>
        </VStack>
      </CardHeader>

      <CardBody>
        {filteredBests.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
            {filteredBests.map((pb, index) => (
              <Tooltip
                key={`${pb.stroke}-${pb.distance}`}
                label={formatTooltipContent(pb)}
                placement="top"
                hasArrow
                bg="gray.900"
                color="white"
                borderRadius="lg"
                p={4}
                openDelay={200}
                closeDelay={100}
                maxW="320px"
                shadow="2xl"
                border="1px solid"
                borderColor="gray.600"
              >
                <MotionCard
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  bg={cardBg}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius="xl"
                  overflow="hidden"
                  size="sm"
                  height="200px"
                  position="relative"
                  _hover={{ 
                    transform: 'translateY(-4px)',
                    shadow: 'xl',
                    borderColor: pb.stroke_color,
                    cursor: 'pointer'
                  }}
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${pb.stroke_color}, ${pb.stroke_color}99)`,
                    zIndex: 1
                  }}
                >
                  <CardHeader 
                    bg="transparent"
                    color={textColor} 
                    py={3} 
                    px={4}
                    minH="60px"
                    position="relative"
                    zIndex={2}
                  >
                    <VStack spacing={1} align="center">
                      <HStack spacing={2} align="center">
                        <Text fontSize="lg" flexShrink={0}>
                          {pb.stroke_icon}
                        </Text>
                        <Badge 
                          colorScheme={pb.primary_best.pool_type === 'LC' ? 'blue' : 'green'}
                          variant="subtle" 
                          size="sm"
                          fontSize="2xs"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontWeight="500"
                        >
                          {pb.primary_best.pool_type}
                        </Badge>
                      </HStack>
                      <Text 
                        fontSize="sm" 
                        fontWeight="600" 
                        noOfLines={2}
                        lineHeight="1.2"
                        color={accentColor}
                        textAlign="center"
                      >
                        {pb.event_name}
                      </Text>
                    </VStack>
                  </CardHeader>

                  <CardBody p={4} display="flex" flexDirection="column" justifyContent="space-between">
                    {/* Best Time - Main Focus */}
                    <VStack spacing={1} align="center" flex="1" justify="center">
                      <Text 
                        fontSize="xl" 
                        fontWeight="700" 
                        color={pb.stroke_color}
                        lineHeight="1.1"
                        letterSpacing="-0.02em"
                        textAlign="center"
                      >
                        {formatTime(pb.primary_best.time)}
                      </Text>
                      <Text fontSize="xs" color={textColor} fontWeight="500">
                        Personal Best
                      </Text>
                      <Text fontSize="xs" color={textColor} fontWeight="500">
                        {pb.primary_best.wa_points} WA pts
                      </Text>
                    </VStack>

                    {/* Date and Venue */}
                    <VStack spacing={1} align="center" mt={3}>
                      <Text fontSize="xs" color={textColor} fontWeight="500" textAlign="center">
                        📅 {formatDate(pb.primary_best.date)}
                      </Text>
                      <Text 
                        fontSize="xs" 
                        color={textColor} 
                        fontWeight="400" 
                        opacity={0.8}
                        textAlign="center"
                        noOfLines={1}
                      >
                        📍 {pb.primary_best.venue}
                      </Text>
                    </VStack>

                    {/* Trend Indicator */}
                    <HStack justify="center" align="center" mt={2}>
                      <Text fontSize="sm">{getTrendIcon(pb.improvement.trend)}</Text>
                      <Badge 
                        colorScheme={getTrendColor(pb.improvement.trend)} 
                        size="sm"
                        fontSize="2xs"
                        variant="subtle"
                        borderRadius="md"
                        fontWeight="500"
                      >
                        {pb.improvement.trend === 'improving' ? 'IMPROVING' : 
                         pb.improvement.trend === 'declining' ? 'DECLINING' : 'STABLE'}
                      </Badge>
                    </HStack>
                  </CardBody>
                </MotionCard>
              </Tooltip>
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={8}>
            <Text fontSize="lg" color="gray.500" mb={2}>
              No personal bests found
            </Text>
            <Text fontSize="sm" color="gray.400">
              {data.personal_bests.length === 0 
                ? "Start competing to see your personal bests here!" 
                : "Try adjusting your search filters"}
            </Text>
          </Box>
        )}
      </CardBody>
    </Card>
  )
}
