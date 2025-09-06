import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
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

    console.log('=== FORM SUBMISSION ===')
    console.log('Submitting swimmer ID:', tiref)
    console.log('Current swimmer before submission:', currentSwimmer?.tiref)
    
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
        title: 'Failed to Load Swimmer',
        description: error instanceof Error ? error.message : 'Please check the membership ID and try again',
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
        title: 'Data Refreshed',
        description: 'Swimming data has been updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Unable to refresh data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color="primary.600">
                Swimmer Lookup
              </Text>
              <Text fontSize="sm" color="gray.600">
                Enter a membership ID to fetch swimming data
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
                  size="sm"
                />
              </Tooltip>
            )}
          </Flex>

          {/* Input Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!validationError && !!tiref} isRequired>
                <FormLabel>Membership ID (Tiref)</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    {isValidating ? (
                      <Spinner size="sm" color="primary.500" />
                    ) : (
                      <SearchIcon color="gray.400" />
                    )}
                  </InputLeftElement>
                  <Input
                    value={tiref}
                    onChange={(e) => setTiref(e.target.value)}
                    placeholder="e.g., 1507205"
                    variant="swimming"
                    bg="white"
                    _placeholder={{ color: 'gray.500' }}
                  />
                </InputGroup>
                <FormErrorMessage>{validationError}</FormErrorMessage>
              </FormControl>

              <HStack spacing={4}>
                <Button
                  type="submit"
                  variant="swimming"
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Loading swimmer data..."
                  isDisabled={!tiref || !/^\d{4,8}$/.test(tiref)}
                  flex={1}
                  leftIcon={<SearchIcon />}
                >
                  {currentSwimmer ? 'Switch Swimmer' : 'Load Swimmer'}
                </Button>
                
                {isValid && !isValidating && (
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge colorScheme="green" p={2} borderRadius="md">
                      ✓ Valid ID
                    </Badge>
                  </MotionBox>
                )}
              </HStack>
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
                bg="primary.50"
                borderRadius="lg"
                border="1px"
                borderColor="primary.200"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="primary.600" fontWeight="medium">
                      Currently Viewing
                    </Text>
                    <Text fontWeight="bold" color="primary.700">
                      {currentSwimmer.name}
                    </Text>
                    {currentSwimmer.club && (
                      <Text fontSize="sm" color="gray.600">
                        {currentSwimmer.club}
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
