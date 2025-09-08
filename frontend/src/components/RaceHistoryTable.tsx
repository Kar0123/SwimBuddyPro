import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Button,
  Flex,
  Spacer,
  useColorModeValue,
  Skeleton,
  SimpleGrid,
  Wrap,
  WrapItem,
  Select,
  ButtonGroup,
  IconButton
} from '@chakra-ui/react'
import { 
  DownloadIcon,
  TriangleUpIcon,
  TriangleDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@chakra-ui/icons'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { SwimRecord } from '../services/api'

const MotionCard = motion(Card)
const MotionTr = motion(Tr)

// Helper function to convert round type codes to full names
const getRoundTypeDisplayName = (roundType: string | undefined): string => {
  if (!roundType) return 'Heat'
  
  const upperRoundType = roundType.toUpperCase()
  switch (upperRoundType) {
    case 'F':
    case 'FINAL':
    case 'FINALS':
      return 'Final'
    case 'H':
    case 'HEAT':
    case 'HEATS':
      return 'Heat'
    case 'SF':
    case 'SEMI':
    case 'SEMIFINAL':
    case 'SEMIFINALS':
      return 'Semi-Final'
    case 'QF':
    case 'QUARTER':
    case 'QUARTERFINAL':
    case 'QUARTERFINALS':
      return 'Quarter-Final'
    default:
      return roundType
  }
}

interface RaceHistoryTableProps {
  records: SwimRecord[]
  isLoading?: boolean
}

type SortField = 'date' | 'stroke' | 'distance' | 'time' | 'waPoints' | 'meet' | 'venue'
type SortDirection = 'asc' | 'desc'

export const RaceHistoryTable = ({ records, isLoading = false }: RaceHistoryTableProps) => {
  // Filter states
  const [selectedStrokes, setSelectedStrokes] = useState<string[]>([])
  const [selectedDistances, setSelectedDistances] = useState<string[]>([])
  const [selectedPoolTypes, setSelectedPoolTypes] = useState<string[]>([])
  
  // Table states
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState<number>(25)

  const headerBg = useColorModeValue('gray.50', 'gray.600')
  const statBg = useColorModeValue('blue.50', 'blue.900')
  const hoverBg = useColorModeValue('blue.50', 'blue.900')

  // Get unique values for filters
  const { strokes, distances } = useMemo(() => {
    const strokes = [...new Set(records.map(r => r.stroke))].sort()
    const distances = [...new Set(records.map(r => r.distance))].sort((a, b) => a - b)
    
    return { strokes, distances }
  }, [records])

  // Filter records based on selected filters
  const filteredRecords = useMemo(() => {
    let filtered = records.filter(record => {
      const matchesStroke = selectedStrokes.length === 0 || selectedStrokes.includes(record.stroke)
      const matchesDistance = selectedDistances.length === 0 || selectedDistances.includes(record.distance.toString())
      const matchesPoolType = selectedPoolTypes.length === 0 || selectedPoolTypes.includes(record.poolType)

      return matchesStroke && matchesDistance && matchesPoolType
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'stroke':
          aValue = a.stroke
          bValue = b.stroke
          break
        case 'distance':
          aValue = a.distance
          bValue = b.distance
          break
        case 'time':
          aValue = a.timeInSeconds
          bValue = b.timeInSeconds
          break
        case 'waPoints':
          aValue = a.waPoints
          bValue = b.waPoints
          break
        case 'meet':
          aValue = a.meet
          bValue = b.meet
          break
        case 'venue':
          aValue = a.venue
          bValue = b.venue
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [records, selectedStrokes, selectedDistances, selectedPoolTypes, sortField, sortDirection])

  // Pagination calculations
  const totalRecords = filteredRecords.length
  const totalPages = Math.ceil(totalRecords / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const endIndex = startIndex + recordsPerPage
  const currentRecords = filteredRecords.slice(startIndex, endIndex)

  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1)
  }

  // Update currentPage when filters change
  useMemo(() => {
    resetPagination()
  }, [selectedStrokes, selectedDistances, selectedPoolTypes])

  // Calculate statistics based on filtered data
  const statistics = useMemo(() => {
    const longCourseRaces = filteredRecords.filter(r => r.poolType === 'LC').length
    const shortCourseRaces = filteredRecords.filter(r => r.poolType === 'SC').length
    const totalEvents = filteredRecords.length
    const bestWAPoints = filteredRecords.length > 0 ? Math.max(...filteredRecords.map(r => r.waPoints)) : 0

    return {
      longCourseRaces,
      shortCourseRaces,
      totalEvents,
      bestWAPoints
    }
  }, [filteredRecords])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'time' ? 'asc' : 'desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />
  }

  const getStrokeColor = (stroke: string) => {
    const colors: Record<string, string> = {
      'Freestyle': 'blue',
      'Backstroke': 'purple',
      'Breaststroke': 'green',
      'Butterfly': 'orange',
      'Individual Medley': 'pink'
    }
    return colors[stroke] || 'gray'
  }

  const toggleFilter = (type: 'stroke' | 'distance' | 'poolType', value: string) => {
    if (type === 'stroke') {
      setSelectedStrokes(prev => 
        prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
      )
    } else if (type === 'distance') {
      setSelectedDistances(prev => 
        prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
      )
    } else if (type === 'poolType') {
      setSelectedPoolTypes(prev => 
        prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
      )
    }
  }

  const clearAllFilters = () => {
    setSelectedStrokes([])
    setSelectedDistances([])
    setSelectedPoolTypes([])
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const distanceCategories = [
    { label: '50m Sprint', distances: [50] },
    { label: '100m Events', distances: distances.filter(d => d >= 100 && d < 200) },
    { label: '200m Events', distances: distances.filter(d => d >= 200 && d < 400) },
    { label: '400+ Distance', distances: distances.filter(d => d >= 400) }
  ]

  const exportToCSV = () => {
    const headers = ['Date', 'Event', 'Time', 'WA Points', 'Meet Name', 'Venue', 'Round', 'Pool Type', 'Season']
    
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        formatDate(record.date),
        `"${record.distance}m ${record.stroke}"`,
        record.time,
        record.waPoints,
        `"${record.meet.replace(/"/g, '""')}"`,
        `"${record.venue.replace(/"/g, '""')}"`,
        `"${getRoundTypeDisplayName(record.roundType)}"`,
        record.poolType === 'LC' ? 'Long Course' : 'Short Course',
        record.season
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `swimming-results-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    // Create a printable version of the data
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Swimming Results - Detailed Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3182ce;
              padding-bottom: 10px;
            }
            .header h1 {
              color: #3182ce;
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .stats {
              display: flex;
              justify-content: space-around;
              margin-bottom: 20px;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
            }
            .stat-box {
              text-align: center;
            }
            .stat-number {
              font-size: 24px;
              font-weight: bold;
              color: #3182ce;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #3182ce; 
              color: white; 
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .stroke-freestyle { background-color: #e6f3ff; }
            .stroke-backstroke { background-color: #f0e6ff; }
            .stroke-breaststroke { background-color: #e6ffe6; }
            .stroke-butterfly { background-color: #ffe6cc; }
            .stroke-im { background-color: #ffe6f3; }
            .pb { 
              background-color: #d4edda !important; 
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏊‍♀️ Detailed Swimming Results</h1>
            <p>Comprehensive race history with professional details</p>
            <p>Generated on ${new Date().toLocaleDateString('en-GB', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">${statistics.longCourseRaces}</div>
              <div class="stat-label">Long Course Races</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${statistics.shortCourseRaces}</div>
              <div class="stat-label">Short Course Races</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${statistics.totalEvents}</div>
              <div class="stat-label">Total Events</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${statistics.bestWAPoints}</div>
              <div class="stat-label">Best WA Points</div>
            </div>
          </div>

          ${(selectedStrokes.length > 0 || selectedDistances.length > 0 || selectedPoolTypes.length > 0) ? `
          <div style="background: #e6f3ff; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
            <strong>Applied Filters:</strong>
            ${selectedStrokes.length > 0 ? `Strokes: ${selectedStrokes.join(', ')} ` : ''}
            ${selectedDistances.length > 0 ? `Distances: ${selectedDistances.map(d => d + 'm').join(', ')} ` : ''}
            ${selectedPoolTypes.length > 0 ? `Pool Types: ${selectedPoolTypes.map(p => p === 'LC' ? 'Long Course' : 'Short Course').join(', ')}` : ''}
          </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Time</th>
                <th>WA Points</th>
                <th>Meet Name</th>
                <th>Venue</th>
                <th>Round</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(record => {
                const strokeClass = record.stroke.toLowerCase().replace(/\s+/g, '-').replace('individual-medley', 'im')
                const pbClass = record.isPersonalBest ? 'pb' : ''
                return `
                  <tr class="stroke-${strokeClass} ${pbClass}">
                    <td>${formatDate(record.date)}</td>
                    <td>${record.distance}m ${record.stroke} (${record.poolType})</td>
                    <td><strong>${record.time}</strong>${record.isPersonalBest ? ' 🏆' : ''}</td>
                    <td>${record.waPoints}</td>
                    <td>${record.meet}</td>
                    <td>${record.venue}</td>
                    <td>${getRoundTypeDisplayName(record.roundType)}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>SwimBuddy Pro - Professional Swimming Performance Analysis</p>
            <p>This report contains ${filteredRecords.length} race records</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
  }

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <Skeleton height="24px" width="300px" />
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} height="60px" width="100%" />
            ))}
          </VStack>
        </CardBody>
      </Card>
    )
  }

  return (
    <MotionCard 
      variant="glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CardHeader>
        <Flex align="center" mb={6}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="primary.600">
              📊 Detailed Swimming Results
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Comprehensive race history with professional details
            </Text>
          </VStack>
          <Spacer />
          <HStack>
            <Button
              leftIcon={<DownloadIcon />}
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={exportToCSV}
            >
              CSV (Filtered)
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              size="sm"
              variant="outline" 
              colorScheme="red"
              onClick={exportToPDF}
            >
              PDF
            </Button>
          </HStack>
        </Flex>

        {/* Pool Type Statistics */}
        <Box mb={6}>
          <Heading size="md" color="blue.600" mb={4}>
            📊 Pool Type Statistics
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card bg={statBg} size="sm">
              <CardBody textAlign="center" py={4}>
                <Text fontSize="2xl" mb={1}>🏊‍♂️</Text>
                <Text color="blue.600" fontWeight="bold" fontSize="sm">Long Course</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {statistics.longCourseRaces}
                </Text>
                <Text fontSize="xs" color="gray.600">races</Text>
              </CardBody>
            </Card>

            <Card bg={statBg} size="sm">
              <CardBody textAlign="center" py={4}>
                <Text fontSize="2xl" mb={1}>🏊‍♀️</Text>
                <Text color="purple.600" fontWeight="bold" fontSize="sm">Short Course</Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {statistics.shortCourseRaces}
                </Text>
                <Text fontSize="xs" color="gray.600">races</Text>
              </CardBody>
            </Card>

            <Card bg={statBg} size="sm">
              <CardBody textAlign="center" py={4}>
                <Text fontSize="2xl" mb={1}>🎯</Text>
                <Text color="orange.600" fontWeight="bold" fontSize="sm">Total Events</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {statistics.totalEvents}
                </Text>
                <Text fontSize="xs" color="gray.600">unique events</Text>
              </CardBody>
            </Card>

            <Card bg={statBg} size="sm">
              <CardBody textAlign="center" py={4}>
                <Text fontSize="2xl" mb={1}>⭐</Text>
                <Text color="green.600" fontWeight="bold" fontSize="sm">Best WA Points</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {statistics.bestWAPoints}
                </Text>
                <Text fontSize="xs" color="gray.600">highest score</Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        {/* Quick Filters */}
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size="sm" color="gray.700">
              🔍 Quick Filters
            </Heading>
            <Text fontSize="xs" color="gray.500">
              Click multiple buttons to combine filters
            </Text>
          </HStack>

          {/* All Events/Stroke Filters - Same Line */}
          <HStack spacing={4} align="center" wrap="wrap">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" minW="fit-content">
              All Events ({records.length})
            </Text>
            <Wrap spacing={2} flex={1}>
              {strokes.map(stroke => {
                const count = records.filter(r => r.stroke === stroke).length
                const isSelected = selectedStrokes.includes(stroke)
                return (
                  <WrapItem key={stroke}>
                    <Button
                      size="sm"
                      variant={isSelected ? "solid" : "outline"}
                      colorScheme={getStrokeColor(stroke)}
                      onClick={() => toggleFilter('stroke', stroke)}
                      leftIcon={<Text fontSize="xs">🏊</Text>}
                    >
                      {stroke} ({count})
                    </Button>
                  </WrapItem>
                )
              })}
            </Wrap>
          </HStack>

          {/* Distance Filters - Same Line */}
          <HStack spacing={4} align="center" wrap="wrap">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" minW="fit-content">
              Distance:
            </Text>
            <Wrap spacing={2} flex={1}>
              {distanceCategories.map(category => {
                const count = category.distances.reduce((sum, dist) => 
                  sum + records.filter(r => r.distance === dist).length, 0
                )
                if (count === 0) return null
                
                const isSelected = category.distances.some(dist => 
                  selectedDistances.includes(dist.toString())
                )
                return (
                  <WrapItem key={category.label}>
                    <Button
                      size="sm"
                      variant={isSelected ? "solid" : "outline"}
                      colorScheme="teal"
                      onClick={() => {
                        category.distances.forEach(dist => 
                          toggleFilter('distance', dist.toString())
                        )
                      }}
                      leftIcon={<Text fontSize="xs">📏</Text>}
                    >
                      {category.label} ({count})
                    </Button>
                  </WrapItem>
                )
              })}
            </Wrap>
          </HStack>

          {/* Pool Type Filters - Same Line */}
          <HStack spacing={4} align="center" wrap="wrap">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" minW="fit-content">
              Pool Type:
            </Text>
            <Wrap spacing={2} flex={1}>
              <WrapItem>
                <Button
                  size="sm"
                  variant={selectedPoolTypes.includes('LC') ? "solid" : "outline"}
                  colorScheme="blue"
                  onClick={() => toggleFilter('poolType', 'LC')}
                  leftIcon={<Text fontSize="xs">🏊‍♂️</Text>}
                >
                  Long Course ({statistics.longCourseRaces + (records.filter(r => r.poolType === 'LC').length - statistics.longCourseRaces)})
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  size="sm"
                  variant={selectedPoolTypes.includes('SC') ? "solid" : "outline"}
                  colorScheme="purple"
                  onClick={() => toggleFilter('poolType', 'SC')}
                  leftIcon={<Text fontSize="xs">🏊‍♀️</Text>}
                >
                  Short Course ({statistics.shortCourseRaces + (records.filter(r => r.poolType === 'SC').length - statistics.shortCourseRaces)})
                </Button>
              </WrapItem>
            </Wrap>
          </HStack>

          {/* Current Filters Display */}
          {(selectedStrokes.length > 0 || selectedDistances.length > 0 || selectedPoolTypes.length > 0) && (
            <Box bg={headerBg} p={3} borderRadius="md">
              <HStack justify="space-between" align="center">
                <HStack>
                  <Text fontSize="sm" fontWeight="medium">📋 Current Filter:</Text>
                  <HStack spacing={1}>
                    {selectedStrokes.map(stroke => (
                      <Badge key={stroke} colorScheme={getStrokeColor(stroke)} variant="solid" size="sm">
                        {stroke}
                      </Badge>
                    ))}
                    {selectedDistances.map(distance => (
                      <Badge key={distance} colorScheme="teal" variant="solid" size="sm">
                        {distance}m
                      </Badge>
                    ))}
                    {selectedPoolTypes.map(poolType => (
                      <Badge key={poolType} colorScheme={poolType === 'LC' ? 'blue' : 'purple'} variant="solid" size="sm">
                        {poolType === 'LC' ? 'Long Course' : 'Short Course'}
                      </Badge>
                    ))}
                  </HStack>
                  <Text fontSize="sm" color="blue.600">
                    • {filteredRecords.length} results
                  </Text>
                </HStack>
                <Button size="xs" variant="ghost" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </HStack>
            </Box>
          )}
        </VStack>
      </CardHeader>

      <CardBody>
        {/* Results Header with Pagination Info */}
        <HStack justify="space-between" align="center" mb={4}>
          <HStack>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              🏊‍♀️ Swimming Results
            </Text>
            <Badge colorScheme="blue" variant="outline">
              SHOWING {startIndex + 1}-{Math.min(endIndex, totalRecords)} OF {totalRecords} RESULTS
            </Badge>
          </HStack>
          
          {/* Records per page selector */}
          <HStack spacing={3}>
            <Text fontSize="sm" color="gray.600">Show:</Text>
            <Select 
              value={recordsPerPage} 
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              size="sm" 
              width="80px"
              bg="white"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={totalRecords}>All</option>
            </Select>
            <Text fontSize="sm" color="gray.600">per page</Text>
          </HStack>
        </HStack>

        {currentRecords.length > 0 ? (
          <>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('stroke')}
                      _hover={{ bg: hoverBg }}
                    >
                      <HStack spacing={1}>
                        <Text>EVENT</Text>
                        {getSortIcon('stroke')}
                      </HStack>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('time')}
                      _hover={{ bg: hoverBg }}
                    >
                      <HStack spacing={1}>
                        <Text>TIME</Text>
                        {getSortIcon('time')}
                      </HStack>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('waPoints')}
                      _hover={{ bg: hoverBg }}
                    >
                      <HStack spacing={1}>
                        <Text>WA POINTS</Text>
                        {getSortIcon('waPoints')}
                      </HStack>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('date')}
                      _hover={{ bg: hoverBg }}
                    >
                      <HStack spacing={1}>
                        <Text>DATE</Text>
                        {getSortIcon('date')}
                      </HStack>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('meet')}
                      _hover={{ bg: hoverBg }}
                    >
                      <HStack spacing={1}>
                        <Text>MEET NAME</Text>
                        {getSortIcon('meet')}
                      </HStack>
                    </Th>
                    <Th 
                      cursor="pointer" 
                      onClick={() => handleSort('venue')}
                      _hover={{ bg: hoverBg }}
                    >
                      <HStack spacing={1}>
                        <Text>VENUE</Text>
                        {getSortIcon('venue')}
                      </HStack>
                    </Th>
                    <Th>ROUND</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentRecords.map((record, index) => (
                    <MotionTr
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      _hover={{ bg: hoverBg }}
                    >
                      <Td>
                        <HStack>
                          <Badge
                            colorScheme={getStrokeColor(record.stroke)}
                            variant="solid"
                            size="sm"
                          >
                            🏊 {record.stroke.toUpperCase()}
                          </Badge>
                          <Text fontWeight="bold">
                            {record.distance}m
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontWeight="bold" fontSize="lg" color="primary.600">
                          {record.time}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="orange" variant="solid" fontSize="sm" px={2} py={1}>
                          {record.waPoints}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {formatDate(record.date)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" noOfLines={2} maxW="200px">
                          {record.meet}
                        </Text>
                      </Td>
                      <Td>
                        <HStack>
                          <Text fontSize="xs">🔴</Text>
                          <Text fontSize="sm" noOfLines={1} maxW="150px">
                            {record.venue}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={record.roundType?.toLowerCase().includes('final') ? 'green' : 'orange'} 
                          variant="outline"
                          size="sm"
                        >
                          {getRoundTypeDisplayName(record.roundType)}
                        </Badge>
                      </Td>
                    </MotionTr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Box p={4} bg={headerBg} borderRadius="md">
                <VStack spacing={4}>
                  <HStack justify="space-between" w="full" align="center">
                    <Text fontSize="sm" color="gray.600">
                      Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, totalRecords)} of {totalRecords} results
                    </Text>
                    
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.600">Records per page:</Text>
                      <Select 
                        value={recordsPerPage} 
                        onChange={(e) => {
                          setRecordsPerPage(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        size="sm" 
                        width="80px"
                        bg="white"
                      >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={totalRecords}>All</option>
                      </Select>
                    </HStack>
                  </HStack>

                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Previous page"
                      icon={<ChevronLeftIcon />}
                      size="sm"
                      isDisabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      variant="outline"
                    />
                    
                    <ButtonGroup size="sm" variant="outline" spacing={1}>
                      {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                        let pageNumber: number
                        
                        if (totalPages <= 7) {
                          pageNumber = i + 1
                        } else if (currentPage <= 4) {
                          pageNumber = i + 1
                        } else if (currentPage >= totalPages - 3) {
                          pageNumber = totalPages - 6 + i
                        } else {
                          pageNumber = currentPage - 3 + i
                        }
                        
                        const isCurrentPage = pageNumber === currentPage
                        
                        return (
                          <Button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            variant={isCurrentPage ? "solid" : "outline"}
                            colorScheme={isCurrentPage ? "blue" : "gray"}
                            size="sm"
                            minW="40px"
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}
                    </ButtonGroup>
                    
                    <IconButton
                      aria-label="Next page"
                      icon={<ChevronRightIcon />}
                      size="sm"
                      isDisabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      variant="outline"
                    />
                  </HStack>
                </VStack>
              </Box>
            )}
          </>
        ) : (
          <Box textAlign="center" py={8}>
            <Text fontSize="lg" color="gray.500" mb={2}>
              No races found
            </Text>
            <Text fontSize="sm" color="gray.400">
              {records.length === 0 
                ? "No race history available" 
                : "Try adjusting your filters"}
            </Text>
          </Box>
        )}
      </CardBody>
    </MotionCard>
  )
}
