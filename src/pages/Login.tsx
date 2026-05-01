import { useState } from 'react';
import { Box, Text, TextInput, PasswordInput, Button, Paper, Alert, Center } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import type { LoginRequest } from '../types';

const Login = () => {
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setCredentials({ ...credentials, [field]: value });
  };

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
    <Center style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-gray-1)' }}>
      <Paper p="xl" radius="md" style={{ maxWidth: 400, width: '100%' }}>
        <Text size="xl" fw={700} ta="center" mb="md" c="blue.7">
          Digital Wallet
        </Text>
        <Text size="lg" ta="center" mb="lg" c="gray.7">
          Login
        </Text>

        {error && <Alert color="red" mb="md">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            type="email"
            value={credentials.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            mb="md"
          />
          <PasswordInput
            label="Password"
            value={credentials.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            mb="xl"
          />
          <Button type="submit" fullWidth loading={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Paper>
    </Center>
  );
};

export default Login;
