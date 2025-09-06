import {
  Box,
  HStack,
  IconButton,
  Text,
  useColorModeValue,
  Spacer
} from '@chakra-ui/react'
import { MinusIcon, SmallCloseIcon } from '@chakra-ui/icons'

export const CustomTitleBar = () => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleMinimize = () => {
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow()
    }
  }

  const handleClose = () => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow()
    }
  }

  return (
    <Box
      h="32px"
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      display="flex"
      alignItems="center"
      px={4}
      style={{ WebkitAppRegion: 'drag' } as any}
      position="relative"
      zIndex={1000}
    >
      <Text fontSize="sm" fontWeight="medium" color="primary.600">
        SwimBuddy Pro
      </Text>
      <Spacer />
      
      <HStack spacing={1} style={{ WebkitAppRegion: 'no-drag' } as any}>
        <IconButton
          aria-label="Minimize"
          icon={<MinusIcon />}
          size="xs"
          variant="ghost"
          onClick={handleMinimize}
          _hover={{ bg: 'gray.100' }}
        />
        <IconButton
          aria-label="Close"
          icon={<SmallCloseIcon />}
          size="xs"
          variant="ghost"
          onClick={handleClose}
          _hover={{ bg: 'red.100', color: 'red.600' }}
        />
      </HStack>
    </Box>
  )
}
