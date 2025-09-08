import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
  Stack,
  Input,
  Button,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  Spinner,
  useToast,
  Badge,
  Flex,
  IconButton,
  Tooltip
} from '@chakra-ui/react'
import { SearchIcon, RepeatIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface SwimmerInputProps {
  onSwimmerSelect: (tiref: string) => Promise<void>
  onRefreshData: () => Promise<void>
  isLoading: boolean
  currentSwimmer: { tiref: string; name: string; club?: string } | null
}

export const SwimmerInput = ({
  onSwimmerSelect,
  onRefreshData,
  isLoading,
  currentSwimmer
}: SwimmerInputProps) => {
  const [tiref, setTiref] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [isValid, setIsValid] = useState(false)
  const toast = useToast()

  // Real-time validation
  useEffect(() => {
    const validateTiref = async () => {
      if (!tiref) {
        setValidationError('')
        setIsValid(false)
        return
      }

      // Basic format validation - allow 4-8 digits to be more flexible
      if (!/^\d{4,8}$/.test(tiref)) {
        setValidationError('Membership ID must be 4-8 digits')
        setIsValid(false)
        return
      }

      setIsValidating(true)
      try {
        // Call backend API to validate tiref
        const response = await fetch(`http://127.0.0.1:8000/api/scraper/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tiref }),
        })
        
        if (!response.ok) {
          throw new Error('Validation request failed')
        }
        
        const result = await response.json()
        
        if (result.valid) {
          setValidationError('')
          setIsValid(true)
        } else {
          setValidationError(result.message || 'Membership ID not found')
          setIsValid(false)
        }
      } catch (error) {
        // If validation fails, allow the ID to proceed (fail-open)
        console.warn('Validation API failed, allowing ID to proceed:', error)
        setValidationError('')
        setIsValid(true)
      } finally {
        setIsValidating(false)
      }
    }

    const debounceTimer = setTimeout(validateTiref, 1000)
    return () => clearTimeout(debounceTimer)
  }, [tiref])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tiref) {
      toast({
        title: 'Missing Membership ID',
        description: 'Please enter a membership ID',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Basic format check - allow 4-8 digits to be more flexible
    if (!/^\d{4,8}$/.test(tiref)) {
      toast({
        title: 'Invalid Format',
        description: 'Membership ID must be 4-8 digits',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

  // Form submission initiated
    
    try {
      await onSwimmerSelect(tiref)
      setTiref('') // Clear input after successful submission
      toast({
        title: 'Swimmer Loaded Successfully',
        description: `Data loaded for membership ID: ${tiref}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Failed to load swimmer:', error)
      toast({
        title: '🌊 Oops! Rough Waters Ahead',
        description: error instanceof Error ? error.message : 'No worries! Check that swimmer ID and let\'s try another stroke! 🏊‍♀️',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleRefresh = async () => {
    try {
      await onRefreshData()
      toast({
        title: '🚀 Fresh Data Splash!',
        description: 'Your swimming data is now crystal clear and updated! 🌟',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: '🐠 Something\'s Fishy...',
        description: 'Couldn\'t refresh the data. Let\'s try that again - third time\'s the charm! 🌊',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Card variant="glass">
      <CardBody>
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          {/* Header */}
          <Flex 
            justify="space-between" 
            align="center" 
            direction={{ base: "column", sm: "row" }}
            gap={{ base: 3, sm: 0 }}
          >
            <VStack align={{ base: "center", sm: "start" }} spacing={1}>
              <Text 
                fontSize={{ base: "md", sm: "lg" }} 
                fontWeight="bold" 
                color="turquoise.600" 
                letterSpacing="-0.01em"
                textAlign={{ base: "center", sm: "left" }}
              >
                🏊‍♀️ Dive into Swimmer Data! 
              </Text>
              <Text 
                fontSize={{ base: "xs", sm: "sm" }} 
                color="seafoam.600"
                textAlign={{ base: "center", sm: "left" }}
              >
                Ready to make a splash? Enter your swimmer ID and let's dive in! 🌊
              </Text>
            </VStack>
            
            {currentSwimmer && (
              <Tooltip label="Refresh current swimmer's data">
                <IconButton
                  aria-label="Refresh data"
                  icon={isLoading ? <Spinner size="sm" /> : <RepeatIcon />}
                  variant="outline"
                  colorScheme="primary"
                  onClick={handleRefresh}
                  isDisabled={isLoading}
                  size={{ base: "md", sm: "sm" }}
                  minH="44px"
                  minW="44px"
                />
              </Tooltip>
            )}
          </Flex>

          {/* Input Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <FormControl isInvalid={!!validationError && !!tiref} isRequired>
                <FormLabel 
                  color="tropical.600" 
                  fontWeight="600"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  🏊‍♂️ Swimmer ID (Let's find your champion!)
                </FormLabel>
                <InputGroup size={{ base: "md", md: "lg" }}>
                  <InputLeftElement>
                    {isValidating ? (
                      <Spinner size="sm" color="turquoise.500" />
                    ) : (
                      <SearchIcon color="seafoam.400" />
                    )}
                  </InputLeftElement>
                  <Input
                    value={tiref}
                    onChange={(e) => setTiref(e.target.value)}
                    placeholder="e.g., 1507205 - Dive in with your ID! 🌊"
                    variant="swimming"
                    bg="white"
                    _placeholder={{ color: 'seafoam.500' }}
                    fontSize={{ base: "sm", md: "md" }}
                    minH="44px"
                  />
                </InputGroup>
                <FormErrorMessage color="coral.500" fontSize={{ base: "xs", md: "sm" }}>
                  🐠 {validationError}
                </FormErrorMessage>
              </FormControl>

              <Stack 
                direction={{ base: "column", sm: "row" }} 
                spacing={{ base: 3, sm: 4 }}
              >
                <Button
                  type="submit"
                  variant="swimming"
                  size={{ base: "md", md: "lg" }}
                  isLoading={isLoading}
                  loadingText="�‍♀️ Fetching swimmer data... This may take 10-30 seconds for complete results"
                  isDisabled={!tiref || !/^\d{4,8}$/.test(tiref)}
                  flex={1}
                  leftIcon={<SearchIcon />}
                  fontFamily="'Inter', 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif"
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="600"
                  letterSpacing="0.025em"
                  textTransform="none"
                  color="blue.600"
                  textShadow="0 1px 2px rgba(0, 0, 0, 0.1)"
                  minH="44px"
                  w={{ base: "100%", sm: "auto" }}
                  _hover={{
                    color: "blue.700",
                    textShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                    transform: "translateY(-0.5px)"
                  }}
                  _active={{
                    color: "blue.800",
                    textShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
                    transform: "translateY(0px)"
                  }}
                  _disabled={{
                    color: "gray.400",
                    textShadow: "none"
                  }}
                  transition="all 0.15s ease"
                >
                  {currentSwimmer ? '🏊‍♀️ Switch Swimmer' : '🚀 Dive In!'}
                </Button>
                
                {isValid && !isValidating && (
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge colorScheme="green" p={2} borderRadius="md">
                      🌟 Ready to make waves!
                    </Badge>
                  </MotionBox>
                )}
              </Stack>
            </VStack>
          </form>

          {/* Current Swimmer Info */}
          {currentSwimmer && (
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                p={4}
                bg="turquoise.50"
                borderRadius="lg"
                border="1px"
                borderColor="turquoise.200"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="turquoise.600" fontWeight="medium">
                      🏊‍♀️ Swimming with Champion
                    </Text>
                    <Text fontWeight="bold" color="tropical.700" letterSpacing="-0.01em">
                      {currentSwimmer.name} 🌟
                    </Text>
                    {currentSwimmer.club && (
                      <Text fontSize="sm" color="seafoam.600">
                        🏊‍♂️ {currentSwimmer.club}
                      </Text>
                    )}
                  </VStack>
                  <Badge colorScheme="primary" variant="solid">
                    ID: {currentSwimmer.tiref}
                  </Badge>
                </HStack>
              </Box>
            </MotionBox>
          )}

          {/* Help Text */}
          <Box
            p={3}
            bg="gray.50"
            borderRadius="md"
            borderLeft="4px"
            borderColor="aqua.400"
          >
            <Text fontSize="sm" color="gray.600">
              💡 <strong>Tip:</strong> You can find membership IDs on swimmingresults.org. 
              Try a valid swimmer ID to load real competition data.
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}
