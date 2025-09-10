import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  Spacer,
  useToast,
  HStack,
  Spinner,
  Progress
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { SwimmerInput } from './components/SwimmerInput'
import { KidDashboard } from './components/KidDashboard'
import { useState, useEffect } from 'react'
import { CustomTitleBar } from './components/CustomTitleBar'
import type { SwimmerData } from './services/api'
import { apiService } from './services/api'
import { PageTransition } from './components/animations/PageTransitions'
import { InstallPWAButton, PWAStatus } from './components/InstallPWA'

const MotionBox = motion(Box)

function App() {
  const [currentSwimmer, setCurrentSwimmer] = useState<SwimmerData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  // Debug: Add event listeners to detect what might be clearing the swimmer data
  useEffect(() => {
    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
      // Page unload detected (no-op)
    }

    const handlePopState = (_e: PopStateEvent) => {
      // Browser navigation detected (handled silently)
    }

    const handleScroll = () => {
      // Silent scroll handler to detect bottom-of-page if needed
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
      if (isAtBottom && currentSwimmer) {
        // Bottom reached — no debug log
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle potentially problematic key combinations without logging
      if ((e.metaKey || e.ctrlKey) && (e.key === 'r' || e.key === 'R')) {
        // Ctrl/Cmd+R detected
      }
      if (e.key === 'F5') {
        // F5 detected
      }
      if (e.key === 'Backspace' && !(e.target as HTMLElement)?.closest('input, textarea')) {
        // Prevent accidental navigation with backspace
        e.preventDefault()
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSwimmer])

  // Log when currentSwimmer changes (kept silent in production)
  useEffect(() => {
    // currentSwimmer updated
  }, [currentSwimmer])

  const bgGradient = useColorModeValue(
    'linear(135deg, #f8fafc 0%, #e2e8f0 20%, #f1f5f9 40%, #e2e8f0 60%, #f8fafc 80%, #f1f5f9 100%)',
    'linear(135deg, gray.900, primary.900, aqua.900)'
  )

  const handleSwimmerSelect = async (tiref: string) => {
    setIsLoading(true)
    setCurrentSwimmer(null) // Clear previous swimmer data immediately
    
    try {
      // Starting swimmer selection flow (no debug logging)

      // Try to get complete swimmer data directly first
      const completeResponse = await apiService.getSwimmerData(tiref)

      if (completeResponse.success && completeResponse.data && completeResponse.data.records && completeResponse.data.records.length > 0) {
        setCurrentSwimmer(completeResponse.data)
        return // Successfully loaded existing data
      } else {
        // No existing data — scrape
        const scrapeResponse = await apiService.scrapeSwimmerData(tiref, true) // Force refresh

        if (scrapeResponse.success) {
          // Wait briefly for backend to process
          await new Promise(resolve => setTimeout(resolve, 1000))

          // After scraping, get the updated data
          const updatedResponse = await apiService.getSwimmerData(tiref)

          if (updatedResponse.success && updatedResponse.data) {
            setCurrentSwimmer(updatedResponse.data)
          } else {
            throw new Error('Failed to retrieve data after scraping')
          }
        } else {
          throw new Error(scrapeResponse.message || `Failed to scrape data for ID: ${tiref}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch swimmer data:', error)
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
      // Swimmer selection completed
    }
  }

  const handleRefreshData = async () => {
    if (!currentSwimmer) return
    
    setIsLoading(true)
    try {
      // Force refresh by scraping new data
      const scrapeResponse = await apiService.scrapeSwimmerData(currentSwimmer.tiref, true)
      
        if (scrapeResponse.success) {
        // Data refreshed successfully for swimmer

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
      // Prevent browser gestures that might cause navigation
      style={{
        overscrollBehavior: 'contain',
        touchAction: 'pan-y pinch-zoom'
      }}
    >
      {/* Custom Title Bar for Electron */}
      <CustomTitleBar />
      
      {/* PWA Status Indicator */}
      <PWAStatus />
      
      {/* Main Content */}
      <Container maxW={{ base: "100%", sm: "container.sm", md: "container.md", lg: "container.xl" }} py={{ base: 2, md: 6 }} px={{ base: 2, md: 6 }}>
        <VStack spacing={{ base: 4, md: 8 }} align="stretch">
          
          {/* PWA Install Banner */}
          <InstallPWAButton variant="banner" />
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Flex align="center" mb={{ base: 4, md: 6 }} justify="center">
              <VStack align={{ base: "center", md: "start" }} spacing={2}>
                <Heading 
                  size={{ base: "xl", md: "2xl" }}
                  bgGradient="linear(to-r, turquoise.500, tropical.500)"
                  bgClip="text"
                  fontWeight="extrabold"
                  letterSpacing="-0.025em"
                  textAlign={{ base: "center", md: "left" }}
                >
                  🏊‍♀️ SwimBuddy Pro
                </Heading>
                <Text 
                  fontSize={{ base: "md", md: "lg" }}
                  color={useColorModeValue('seafoam.600', 'seafoam.300')}
                  fontWeight="medium"
                  letterSpacing="-0.01em"
                  textAlign={{ base: "center", md: "left" }}
                >
                  🌊 Dive Deep into Your Swimming Journey! 🌟
                </Text>
              </VStack>
              <Spacer />
              <HStack spacing={4}>
                {currentSwimmer && (
                  <VStack align="end" spacing={1}>
                    <Text fontSize="sm" color="turquoise.500" fontWeight="500">🏊‍♀️ Swimming with</Text>
                    <Text fontWeight="bold" color="tropical.600" letterSpacing="-0.01em">
                      {currentSwimmer.name} 🌟
                    </Text>
                    {currentSwimmer.club && (
                      <Text fontSize="sm" color="seafoam.500">
                        🏊‍♂️ {currentSwimmer.club}
                      </Text>
                    )}
                  </VStack>
                )}
              </HStack>
            </Flex>
          </MotionBox>

          {/* Main Content */}
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
          <PageTransition 
            isVisible={!currentSwimmer && !isLoading}
            transitionKey="welcome"
            direction="fade"
            delay={0.3}
          >
            <Box
              textAlign="center"
              py={{ base: 8, md: 16 }}
              px={{ base: 4, md: 0 }}
              color={useColorModeValue('gray.600', 'gray.400')}
            >
              <Text fontSize={{ base: "lg", md: "xl" }} mb={4}>
                Welcome to SwimBuddy Pro! 🏊‍♂️
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }} maxW={{ base: "sm", md: "md" }} mx="auto" lineHeight="tall">
                Enter a swimmer's membership ID above to start analyzing their 
                swimming performance with professional-grade insights and beautiful visualizations.
              </Text>
            </Box>
          </PageTransition>
        </VStack>
      </Container>
      
      {/* Mobile-optimized Loading Overlay */}
      {isLoading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={9999}
          display={{ base: "flex", md: "none" }}
          alignItems="center"
          justifyContent="center"
          backdropFilter="blur(4px)"
        >
          <VStack spacing={4} bg="white" p={6} borderRadius="xl" shadow="2xl" mx={4} maxW="sm">
            <Spinner size="xl" color="turquoise.500" thickness="4px" />
            <Text fontSize="lg" fontWeight="600" textAlign="center">
              🏊‍♀️ Fetching Swimmer Data
            </Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              This may take 10-30 seconds for complete results. We're gathering all the swimming data!
            </Text>
            <Progress 
              size="sm" 
              isIndeterminate 
              colorScheme="turquoise" 
              w="100%" 
              borderRadius="full"
            />
          </VStack>
        </Box>
      )}
    </Box>
  )
}

export default App
