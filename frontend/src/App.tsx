import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  Spacer,
  useToast
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { SwimmerInput } from './components/SwimmerInput'
import { KidDashboard } from './components/KidDashboard'
import { useState } from 'react'
import { CustomTitleBar } from './components/CustomTitleBar'
import type { SwimmerData } from './services/api'
import { apiService } from './services/api'

const MotionBox = motion(Box)

function App() {
  const [currentSwimmer, setCurrentSwimmer] = useState<SwimmerData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const bgGradient = useColorModeValue(
    'linear(to-br, primary.50, aqua.50, wave.50)',
    'linear(to-br, gray.900, primary.900, aqua.900)'
  )

  const handleSwimmerSelect = async (tiref: string) => {
    setIsLoading(true)
    setCurrentSwimmer(null) // Clear previous swimmer data immediately
    
    try {
      console.log('=== Starting swimmer selection for:', tiref, '===')
      
      // Try to get complete swimmer data directly first
      console.log('Step 1: Checking for existing data...')
      const completeResponse = await apiService.getSwimmerData(tiref)
      console.log('Complete data response:', completeResponse)
      
      if (completeResponse.success && completeResponse.data && completeResponse.data.records && completeResponse.data.records.length > 0) {
        console.log('✅ Found existing data with', completeResponse.data.records.length, 'records')
        setCurrentSwimmer(completeResponse.data)
        return // Successfully loaded existing data
      } else {
        console.log('❌ No existing data or empty records, need to scrape')
        
        // If no cached data or empty records, scrape from website
        console.log('Step 2: Triggering scrape...')
        const scrapeResponse = await apiService.scrapeSwimmerData(tiref, true) // Force refresh
        console.log('Scrape response:', scrapeResponse)
        
        if (scrapeResponse.success) {
          console.log('✅ Scrape successful, fetching updated data...')
          
          // Wait a moment for data to be processed
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // After scraping, get the updated data
          const updatedResponse = await apiService.getSwimmerData(tiref)
          console.log('Updated data response:', updatedResponse)
          
          if (updatedResponse.success && updatedResponse.data) {
            console.log('✅ Successfully loaded', updatedResponse.data.records?.length || 0, 'records')
            setCurrentSwimmer(updatedResponse.data)
          } else {
            throw new Error('Failed to retrieve data after scraping')
          }
        } else {
          console.log('❌ Scrape failed:', scrapeResponse.message)
          throw new Error(scrapeResponse.message || `Failed to scrape data for ID: ${tiref}`)
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch swimmer data:', error)
      toast({
        title: 'Unable to load swimmer data',
        description: error instanceof Error ? error.message : 'Please check the swimmer ID and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setCurrentSwimmer(null)
    } finally {
      setIsLoading(false)
      console.log('=== Swimmer selection completed ===')
    }
  }

  const handleRefreshData = async () => {
    if (!currentSwimmer) return
    
    setIsLoading(true)
    try {
      // Force refresh by scraping new data
      const scrapeResponse = await apiService.scrapeSwimmerData(currentSwimmer.tiref, true)
      
      if (scrapeResponse.success) {
        console.log('Data refreshed successfully for swimmer:', currentSwimmer.tiref)
        
        // Get updated data after refresh
        const updatedResponse = await apiService.getSwimmerData(currentSwimmer.tiref)
        if (updatedResponse.success && updatedResponse.data) {
          setCurrentSwimmer(updatedResponse.data)
        }
      } else {
        console.error('Failed to refresh data:', scrapeResponse.message)
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      position="relative"
    >
      {/* Custom Title Bar for Electron */}
      <CustomTitleBar />
      
      {/* Main Content */}
      <Container maxW="container.xl" py={6}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Flex align="center" mb={6}>
              <VStack align="start" spacing={2}>
                <Heading 
                  size="2xl" 
                  bgGradient="linear(to-r, primary.500, aqua.500)"
                  bgClip="text"
                  fontWeight="extrabold"
                >
                  🏊‍♀️ SwimBuddy Pro
                </Heading>
                <Text 
                  fontSize="lg" 
                  color={useColorModeValue('gray.600', 'gray.300')}
                  fontWeight="medium"
                >
                  Professional Swimming Performance Analytics
                </Text>
              </VStack>
              <Spacer />
              {currentSwimmer && (
                <VStack align="end" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Current Swimmer</Text>
                  <Text fontWeight="bold" color="primary.600">
                    {currentSwimmer.name}
                  </Text>
                  {currentSwimmer.club && (
                    <Text fontSize="sm" color="gray.500">
                      {currentSwimmer.club}
                    </Text>
                  )}
                </VStack>
              )}
            </Flex>
          </MotionBox>

          {/* Swimmer Input Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SwimmerInput
              onSwimmerSelect={handleSwimmerSelect}
              onRefreshData={handleRefreshData}
              isLoading={isLoading}
              currentSwimmer={currentSwimmer}
            />
          </MotionBox>

          {/* Dashboard */}
          {currentSwimmer && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <KidDashboard 
                swimmer={currentSwimmer}
                isLoading={isLoading}
              />
            </MotionBox>
          )}

          {/* Welcome Message */}
          {!currentSwimmer && !isLoading && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Box
                textAlign="center"
                py={16}
                color={useColorModeValue('gray.600', 'gray.400')}
              >
                <Text fontSize="xl" mb={4}>
                  Welcome to SwimBuddy Pro! 🏊‍♂️
                </Text>
                <Text fontSize="md" maxW="md" mx="auto" lineHeight="tall">
                  Enter a swimmer's membership ID above to start analyzing their 
                  swimming performance with professional-grade insights and beautiful visualizations.
                </Text>
              </Box>
            </MotionBox>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default App
