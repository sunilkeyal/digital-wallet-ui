import { Box, Heading, Text, SimpleGrid, Card, HStack, VStack } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { IconVaccine, IconCreditCard, IconFlask } from '@tabler/icons-react';

const stats = [
  { name: 'Immunizations', value: 'View Records', href: '/immunizations', icon: IconVaccine },
  { name: 'Insurance Cards', value: 'View Cards', href: '/insurance-cards', icon: IconCreditCard },
  { name: 'Lab Results', value: 'View Results', href: '/lab-results', icon: IconFlask },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Heading as="h1" size="lg" mb={1}>
        Welcome{user?.firstName ? `, ${user.firstName}` : ''}
      </Heading>
      <Text color="gray.500" fontSize="sm" mb={6}>
        Here&apos;s a quick overview of your health records.
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4} mb={8}>
        {stats.map((stat) => (
          <Card.Root key={stat.name} as="a" href={stat.href} variant="outline" _hover={{ shadow: 'md' }}>
            <Card.Body>
              <HStack gap={4}>
                <Box p={3} rounded="lg" bg="blue.50" color="blue.600">
                  <Box as={stat.icon} size={24} />
                </Box>
                <VStack gap={0} align="start">
                  <Text color="gray.500" fontSize="sm">{stat.name}</Text>
                  <Text fontWeight="semibold">{stat.value}</Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
