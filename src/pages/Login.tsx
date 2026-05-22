import { useState } from 'react';
import { Box, Button, Center, Field, Heading, Input, Text, VStack, Alert } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import type { LoginRequest } from '../types';

const Login = () => {
  const [credentials, setCredentials] = useState<LoginRequest>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(credentials);
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <Box w="full" maxW="sm" mx={4}>
        <VStack gap={6} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="xl" color="blue.600" mb={1}>
              Digital Wallet
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Sign in to your account
            </Text>
          </Box>

          {error && (
            <Alert.Root status="error">
              <Alert.Content>{error}</Alert.Content>
            </Alert.Root>
          )}

          <Box as="form" onSubmit={handleSubmit}>
            <VStack gap={4}>
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  required
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </Field.Root>

              <Button type="submit" colorScheme="blue" w="full" loading={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Center>
  );
};

export default Login;
