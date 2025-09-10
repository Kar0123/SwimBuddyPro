import React, { useState, useEffect } from 'react';
import { Button, Box, Text, Icon, useToast, Flex } from '@chakra-ui/react';
import { FiDownload, FiSmartphone, FiMonitor } from 'react-icons/fi';

interface InstallPWAButtonProps {
  variant?: 'button' | 'banner';
}

export const InstallPWAButton: React.FC<InstallPWAButtonProps> = ({ 
  variant = 'button' 
}) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Check if PWA manager is available
    const checkInstallability = () => {
      if (window.pwaManager) {
        setIsInstallable(window.pwaManager.isInstallPromptAvailable());
        setIsInstalled(window.pwaManager.getInstallStatus());
      }
    };

    // Initial check
    checkInstallability();

    // Listen for PWA events
    const handleInstallAvailable = () => {
      setIsInstallable(true);
      setIsInstalled(false);
    };

    const handleInstallCompleted = () => {
      setIsInstallable(false);
      setIsInstalled(true);
      toast({
        title: "🏊‍♀️ Desktop App Installed!",
        description: "SwimBuddy Pro is now available from your desktop",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-install-completed', handleInstallCompleted);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-install-completed', handleInstallCompleted);
    };
  }, [toast]);

  const handleInstall = async () => {
    if (!window.pwaManager || !isInstallable) return;

    setIsInstalling(true);
    try {
      const success = await window.pwaManager.installApp();
      if (success) {
        toast({
          title: "🎉 Installation Started!",
          description: "SwimBuddy Pro will appear on your desktop shortly",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Installation Cancelled",
          description: "You can install SwimBuddy Pro later from your browser menu",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('PWA install error:', error);
      toast({
        title: "Installation Error",
        description: "Please try installing from your browser menu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsInstalling(false);
    }
  };

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  if (variant === 'banner') {
    return (
      <Box
        bg="linear-gradient(135deg, rgba(0, 188, 212, 0.1), rgba(0, 151, 167, 0.1))"
        border="1px solid"
        borderColor="cyan.200"
        borderRadius="xl"
        p={4}
        mb={6}
        backdropFilter="blur(10px)"
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
          <Box flex="1" minW="200px">
            <Flex align="center" mb={2}>
              <Icon as={FiMonitor} color="cyan.400" mr={2} />
              <Text fontWeight="bold" color="cyan.100">
                Install Desktop App
              </Text>
            </Flex>
            <Text fontSize="sm" color="gray.300">
              Get SwimBuddy Pro as a desktop app for faster access and offline support
            </Text>
          </Box>
          <Button
            onClick={handleInstall}
            isLoading={isInstalling}
            loadingText="Installing..."
            colorScheme="cyan"
            size="sm"
            leftIcon={<FiDownload />}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg'
            }}
          >
            Install Now
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Button
      onClick={handleInstall}
      isLoading={isInstalling}
      loadingText="Installing..."
      colorScheme="cyan"
      variant="outline"
      size="sm"
      leftIcon={<FiDownload />}
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'lg',
        bg: 'rgba(0, 188, 212, 0.1)'
      }}
    >
      Install App
    </Button>
  );
};

// PWA Status Component
export const PWAStatus: React.FC = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const checkPWAStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
    };

    checkPWAStatus();

    // Listen for install completion
    const handleInstallCompleted = () => {
      setIsPWA(true);
    };

    window.addEventListener('pwa-install-completed', handleInstallCompleted);
    window.addEventListener('appinstalled', handleInstallCompleted);

    return () => {
      window.removeEventListener('pwa-install-completed', handleInstallCompleted);
      window.removeEventListener('appinstalled', handleInstallCompleted);
    };
  }, []);

  if (isPWA) {
    return (
      <Box
        position="fixed"
        top={4}
        right={4}
        bg="rgba(0, 188, 212, 0.1)"
        border="1px solid"
        borderColor="cyan.400"
        borderRadius="lg"
        px={3}
        py={2}
        backdropFilter="blur(10px)"
        zIndex={1000}
      >
        <Flex align="center">
          <Icon as={FiSmartphone} color="cyan.400" mr={2} />
          <Text fontSize="xs" color="cyan.100" fontWeight="medium">
            Desktop App
          </Text>
        </Flex>
      </Box>
    );
  }

  return null;
};
