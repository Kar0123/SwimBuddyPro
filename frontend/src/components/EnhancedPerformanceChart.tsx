import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Select,
  useColorModeValue,
  Badge,
  Grid,
  GridItem,
  Icon,
  Divider,
  Button
} from '@chakra-ui/react'
import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  type ChartOptions
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { Line } from 'react-chartjs-2'
import { CalendarIcon } from '@chakra-ui/icons'
import 'chartjs-adapter-date-fns'
import type { SwimRecord, PersonalBest } from '../services/api'
import { RecentPerformanceComparison } from './RecentPerformanceComparison'
import { ErrorBoundary } from './ErrorBoundary'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
)

interface EnhancedPerformanceChartProps {
  records: SwimRecord[]
  personalBests: PersonalBest[]
  onFilterChange?: (distance: string, stroke: string, poolType: string) => void
}

export const EnhancedPerformanceChart = ({ records, personalBests, onFilterChange }: EnhancedPerformanceChartProps) => {
  const [selectedDistance, setSelectedDistance] = useState<string>('50')
  const [selectedStroke, setSelectedStroke] = useState<string>('Freestyle')
  const [selectedPoolType, setSelectedPoolType] = useState<string>('Long Course (LC)')
  
  const chartRef = useRef<any>(null)

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headerBg = useColorModeValue('blue.50', 'blue.900')
  const selectionBg = useColorModeValue('gray.50', 'gray.600')
  const chartBg = useColorModeValue('blue.50', 'blue.900')

  // Notify parent component when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(selectedDistance, selectedStroke, selectedPoolType)
    }
  }, [selectedDistance, selectedStroke, selectedPoolType, onFilterChange])

  // Reset zoom function
  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom()
    }
  }

  // Get unique values for dropdowns
  const distances = [...new Set(records.map(r => r.distance.toString()))].sort((a, b) => Number(a) - Number(b))
  const strokes = [...new Set(records.map(r => r.stroke))]
  const poolTypes = ['Long Course (LC)', 'Short Course (SC)']

  // Filter records based on current selection
  const filteredRecords = useMemo(() => {
    const poolTypeFilter = selectedPoolType === 'Long Course (LC)' ? 'LC' : 'SC'
    
    return records
      .filter(record => 
        record.distance.toString() === selectedDistance &&
        record.stroke === selectedStroke &&
        record.poolType === poolTypeFilter
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [records, selectedDistance, selectedStroke, selectedPoolType])

  // Chart data
  const chartData = useMemo(() => {
    const strokeColors: Record<string, string> = {
      'Freestyle': '#2196F3',
      'Backstroke': '#9C27B0',
      'Breaststroke': '#4CAF50',
      'Butterfly': '#FF9800',
      'Individual Medley': '#E91E63'
    }

    return {
      datasets: [{
        label: `${selectedDistance}m ${selectedStroke}`,
        data: filteredRecords.map(record => ({
          x: record.date,
          y: record.timeInSeconds
        })),
        borderColor: strokeColors[selectedStroke] || '#2196F3',
        backgroundColor: (strokeColors[selectedStroke] || '#2196F3') + '20',
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: strokeColors[selectedStroke] || '#2196F3',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: strokeColors[selectedStroke] || '#2196F3',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
        borderWidth: 3,
      }]
    }
  }, [filteredRecords, selectedDistance, selectedStroke])

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `${selectedDistance}m ${selectedStroke} Swimming Performance Progress (${selectedPoolType === 'Long Course (LC)' ? 'Long Course 50m Pool' : 'Short Course 25m Pool'})`,
        color: useColorModeValue('#1A202C', '#F7FAFC'),
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: useColorModeValue('#4A5568', '#CBD5E0'),
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(45, 55, 72, 0.95)'),
        titleColor: useColorModeValue('#2D3748', '#F7FAFC'),
        bodyColor: useColorModeValue('#4A5568', '#CBD5E0'),
        borderColor: useColorModeValue('#E2E8F0', '#4A5568'),
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: function(context) {
            const date = new Date(context[0].parsed.x)
            return `Competition Date: ${date.toLocaleDateString()}`
          },
          label: function(context) {
            const record = filteredRecords.find(r => 
              new Date(r.date).getTime() === context.parsed.x && r.timeInSeconds === context.parsed.y
            )
            
            const time = context.parsed.y
            const minutes = Math.floor(time / 60)
            const seconds = (time % 60).toFixed(2)
            const formattedTime = minutes > 0 ? `${minutes}:${seconds.padStart(5, '0')}` : seconds

            const lines = [
              `🏊‍♀️ Swim Time: ${formattedTime}`,
              `🏊‍♂️ Stroke: ${selectedStroke}`,
              `🏊‍♀️ Distance: ${selectedDistance}m`,
              `🏊‍♂️ Pool Type: ${selectedPoolType === 'Long Course (LC)' ? 'Long Course (50m)' : 'Short Course (25m)'}`,
            ]

            if (record) {
              if (record.venue) {
                lines.push(`📍 Venue: ${record.venue}`)
              }
              if (record.meet) {
                lines.push(`🏆 Meet: ${record.meet}`)
              }
              if (record.waPoints) {
                lines.push(`⭐ WA Points: ${record.waPoints}`)
              }
              if (record.rank) {
                lines.push(`🥇 Rank: ${record.rank}`)
              }
              if (record.roundType) {
                lines.push(`🏁 Round: ${record.roundType}`)
              }
              if (record.heat && record.lane) {
                lines.push(`🏊‍♂️ Heat ${record.heat}, Lane ${record.lane}`)
              }
              if (record.isPersonalBest) {
                lines.push(`🏆 PERSONAL BEST!`)
              }
            }

            return lines
          }
        }
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          drag: {
            enabled: false
          },
          mode: 'x',
          onZoomComplete: function() {
            // Optional: Add any callback when zoom is complete
          }
        },
        pan: {
          enabled: true,
          mode: 'x',
          threshold: 10,
        },
        limits: {
          x: {min: 'original', max: 'original'},
          y: {min: 'original', max: 'original'}
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            month: 'yyyy-MM-dd',
            day: 'yyyy-MM-dd'
          }
        },
        title: {
          display: true,
          text: '📅 Competition Date',
          color: useColorModeValue('#4A5568', '#CBD5E0'),
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: useColorModeValue('#E2E8F0', '#4A5568'),
          lineWidth: 1
        },
        ticks: {
          color: useColorModeValue('#4A5568', '#CBD5E0'),
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: false,
        reverse: false, // Normal order: higher values at top, lower at bottom
        title: {
          display: true,
          text: 'Swimming Time (faster times at bottom = Improvement ⬇️)',
          color: useColorModeValue('#4A5568', '#CBD5E0'),
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: useColorModeValue('#E2E8F0', '#4A5568'),
          lineWidth: 1
        },
        ticks: {
          color: useColorModeValue('#4A5568', '#CBD5E0'),
          font: {
            size: 11
          },
          callback: function(value) {
            const time = Number(value)
            const minutes = Math.floor(time / 60)
            const seconds = (time % 60).toFixed(1)
            return minutes > 0 ? `${minutes}:${seconds.padStart(4, '0')}` : `${seconds}s`
          }
        },
        // Add some padding to make the range clearer
        suggestedMin: function(context: any) {
          const data = context.chart.data.datasets[0]?.data || []
          if (data.length === 0) return undefined
          const times = data.map((point: any) => point.y)
          const minTime = Math.min(...times)
          return minTime * 0.98 // Show slightly below the fastest time
        },
        suggestedMax: function(context: any) {
          const data = context.chart.data.datasets[0]?.data || []
          if (data.length === 0) return undefined
          const times = data.map((point: any) => point.y)
          const maxTime = Math.max(...times)
          return maxTime * 1.02 // Show slightly above the slowest time
        }
      }
    }
  }

  // Get time range for display
  const getTimeRange = () => {
    if (filteredRecords.length === 0) return 'No data'
    const dates = filteredRecords.map(r => new Date(r.date))
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())))
    
    if (filteredRecords.length === 1) {
      return earliest.toLocaleDateString()
    }
    
    const minTime = Math.min(...filteredRecords.map(r => r.timeInSeconds))
    const maxTime = Math.max(...filteredRecords.map(r => r.timeInSeconds))
    
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = (seconds % 60).toFixed(2)
      return mins > 0 ? `${mins}:${secs.padStart(5, '0')}` : `${secs}s`
    }
    
    return `${formatTime(minTime)} to ${formatTime(maxTime)}`
  }

  return (
    <Card bg={cardBg} borderWidth={1} borderColor={borderColor} shadow="lg">
      {/* Header */}
      <CardHeader bg={headerBg} borderTopRadius="md">
        <HStack spacing={3} align="center">
          <Box 
            bg="purple.500" 
            color="white"
            p={3} 
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={CalendarIcon} boxSize={6} />
          </Box>
          <Heading size="lg" color="purple.600" fontWeight="600">
            Performance Progress
          </Heading>
        </HStack>
      </CardHeader>

      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          {/* Brief Info Section */}
          <Box bg={useColorModeValue('purple.50', 'purple.900')} p={4} borderRadius="lg" borderWidth={1} borderColor="purple.200">
            <VStack spacing={2} align="start">
              <HStack spacing={2}>
                <Text fontSize="sm" color="purple.600" fontWeight="500">
                  📊 Performance progression over time - Select specific pool type for cleaner view
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="sm" color="purple.600" fontWeight="500">
                  📈 Graph shows improvement: downward trend means getting faster!
                </Text>
              </HStack>
            </VStack>
          </Box>
          {/* Filter Controls */}
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            <GridItem>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  🏊‍♂️ Distance:
                </Text>
                <Select
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(e.target.value)}
                  bg={useColorModeValue('white', 'gray.600')}
                  borderColor="blue.200"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182CE' }}
                >
                  {distances.map(distance => (
                    <option key={distance} value={distance}>{distance}m</option>
                  ))}
                </Select>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  🏊‍♀️ Stroke:
                </Text>
                <Select
                  value={selectedStroke}
                  onChange={(e) => setSelectedStroke(e.target.value)}
                  bg={useColorModeValue('white', 'gray.600')}
                  borderColor="blue.200"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182CE' }}
                >
                  {strokes.map(stroke => (
                    <option key={stroke} value={stroke}>{stroke}</option>
                  ))}
                </Select>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                  🏊‍♂️ Pool Type:
                </Text>
                <Select
                  value={selectedPoolType}
                  onChange={(e) => setSelectedPoolType(e.target.value)}
                  bg={useColorModeValue('white', 'gray.600')}
                  borderColor="blue.200"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182CE' }}
                >
                  {poolTypes.map(poolType => (
                    <option key={poolType} value={poolType}>{poolType}</option>
                  ))}
                </Select>
              </VStack>
            </GridItem>
          </Grid>

          {/* Current Selection Summary */}
          <Card bg={selectionBg} borderWidth={1} borderColor="blue.200">
            <CardBody py={4}>
              <VStack spacing={3} align="stretch">
                <Text fontSize="md" fontWeight="bold" color="gray.700">
                  📊 Current Selection
                </Text>
                <HStack spacing={6}>
                  <Badge colorScheme="blue" variant="solid" px={3} py={1}>
                    DISTANCE {selectedDistance}m
                  </Badge>
                  <Badge colorScheme="purple" variant="solid" px={3} py={1}>
                    STROKE {selectedStroke}
                  </Badge>
                  <Badge colorScheme="green" variant="solid" px={3} py={1}>
                    POOL {selectedPoolType === 'Long Course (LC)' ? 'LC' : 'SC'}
                  </Badge>
                </HStack>
                <HStack>
                  <Text fontSize="sm" color="gray.600">
                    📊 Records Found: <strong>{filteredRecords.length}</strong>
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Available: {distances.length} distances, {strokes.length} strokes
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Divider />

          {/* Chart Section */}
          <Card bg={chartBg} borderWidth={1} borderColor="blue.200">
            <CardHeader>
              <VStack spacing={3} align="center">
                <Text fontSize="lg" fontWeight="bold" color="blue.700">
                  📈 {filteredRecords.length} records for {selectedDistance}m {selectedStroke} ({selectedPoolType === 'Long Course (LC)' ? 'Long Course' : 'Short Course'})
                </Text>
                <Text fontSize="sm" color="blue.600">
                  Time range: {getTimeRange()}
                </Text>
                <HStack spacing={4} align="center">
                  <Text fontSize="xs" color="blue.500" fontWeight="medium">
                    🖱️ Scroll to zoom | Drag to pan | Double-click to reset
                  </Text>
                  <Button
                    size="xs"
                    colorScheme="blue"
                    variant="outline"
                    onClick={resetZoom}
                    fontSize="xs"
                  >
                    Reset Zoom
                  </Button>
                </HStack>
              </VStack>
            </CardHeader>
            <CardBody>
              <Box h="500px" bg={useColorModeValue('white', 'gray.800')} borderRadius="md" p={4}>
                {filteredRecords.length > 0 ? (
                  <Line ref={chartRef} data={chartData} options={chartOptions} />
                ) : (
                  <Box h="100%" display="flex" alignItems="center" justifyContent="center">
                    <VStack spacing={4}>
                      <Text fontSize="xl" color="gray.500">📊 No data available</Text>
                      <Text fontSize="md" color="gray.400" textAlign="center">
                        No races found for {selectedDistance}m {selectedStroke} in {selectedPoolType}
                      </Text>
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Try selecting a different combination above
                      </Text>
                    </VStack>
                  </Box>
                )}
              </Box>
            </CardBody>
          </Card>

          {/* Integrated Performance Comparison */}
          <Box mt={8}>
            <Card 
              bg={useColorModeValue('green.50', 'green.900')} 
              borderWidth={2} 
              borderColor="green.200" 
              shadow="lg"
              borderRadius="xl"
              overflow="hidden"
            >
              <CardHeader pb={4} bg={useColorModeValue('green.100', 'green.800')}>
                <VStack spacing={3}>
                  <HStack spacing={4} align="center" justify="center">
                    <Box 
                      bg="green.500" 
                      color="white"
                      p={3} 
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="md"
                    >
                      <Text fontSize="xl" fontWeight="bold">📈</Text>
                    </Box>
                    <VStack spacing={1} align="center">
                      <Text fontSize="xl" fontWeight="bold" color="green.800" letterSpacing="tight">
                        Performance Analytics
                      </Text>
                      <Text fontSize="sm" color="green.600" fontWeight="medium">
                        Detailed comparison insights
                      </Text>
                    </VStack>
                  </HStack>
                  <Box bg="white" px={4} py={2} borderRadius="full" shadow="sm" border="1px solid" borderColor="green.200">
                    <HStack spacing={2} align="center">
                      <Box w="2" h="2" bg="green.500" borderRadius="full"></Box>
                      <Text fontSize="sm" color="green.700" fontWeight="semibold">
                        {selectedDistance}m {selectedStroke} • {selectedPoolType === 'Long Course (LC)' ? 'Long Course' : 'Short Course'}
                      </Text>
                      <Box w="2" h="2" bg="green.500" borderRadius="full"></Box>
                    </HStack>
                  </Box>
                </VStack>
              </CardHeader>
              <CardBody px={6} py={6}>
                {records && personalBests ? (
                  <ErrorBoundary>
                    <RecentPerformanceComparison
                      records={records}
                      personalBests={personalBests}
                      selectedDistance={selectedDistance}
                      selectedStroke={selectedStroke}
                      selectedPoolType={selectedPoolType}
                    />
                  </ErrorBoundary>
                ) : (
                  <Box textAlign="center" py={12}>
                    <VStack spacing={4}>
                      <Box 
                        bg="gray.100" 
                        p={4} 
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="2xl">⏳</Text>
                      </Box>
                      <VStack spacing={2}>
                        <Text color="gray.600" fontSize="lg" fontWeight="semibold">
                          Loading performance comparison...
                        </Text>
                        <Text color="gray.500" fontSize="sm">
                          Analyzing your swimming data
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                )}
              </CardBody>
            </Card>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}
