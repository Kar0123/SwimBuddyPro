import React from 'react'
import { Text, Card, CardBody } from '@chakra-ui/react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <Card bg="red.50" borderColor="red.200" borderWidth="1px">
          <CardBody>
            <Text color="red.600" fontWeight="bold">Something went wrong</Text>
            <Text color="red.500" fontSize="sm" mt={2}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
          </CardBody>
        </Card>
      )
    }

    return this.props.children
  }
}
