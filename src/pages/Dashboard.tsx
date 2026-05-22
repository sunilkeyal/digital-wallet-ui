import { Box, Heading, Text, SimpleGrid, Card, HStack, VStack, Separator } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NoteContext';
import { useNavigate } from 'react-router-dom';
import { IconVaccine, IconCreditCard, IconFlask, IconNotes, IconClock } from '@tabler/icons-react';

const stats = [
  { name: 'Immunizations', value: 'View and manage your vaccination history', href: '/immunizations', icon: IconVaccine },
  { name: 'Insurance Cards', value: 'Securely store and access your insurance cards', href: '/insurance-cards', icon: IconCreditCard },
  { name: 'Lab Results', value: 'Review and track your laboratory test results', href: '/lab-results', icon: IconFlask },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { recentNotes, recordView } = useNotes();
  const navigate = useNavigate();

  const openNote = (noteId: string) => {
    recordView(noteId);
    navigate(`/notes?noteId=${noteId}`);
  };

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
                  <Text fontWeight="bold" fontSize="sm">{stat.name}</Text>
                  <Text fontSize="sm">{stat.value}</Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
        {recentNotes.length > 0 && (
          <Card.Root variant="outline" _hover={{ shadow: 'md' }}>
            <Card.Body p={3}>
              <HStack gap={4} mb={2}>
                <Box p={3} rounded="lg" bg="blue.50" color="blue.600">
                  <IconClock size={24} />
                </Box>
                <VStack gap={0} align="start">
                  <Text fontWeight="bold" fontSize="sm">Recent Notes</Text>
                  <Text fontSize="sm">Quickly access your most recently viewed notes</Text>
                </VStack>
              </HStack>
              <Separator mb={2} />
              <VStack gap={1} align="stretch">
                {recentNotes.map((entry) => (
                  <HStack
                    key={entry.note.id}
                    p={2}
                    gap={3}
                    cursor="pointer"
                    _hover={{ bg: 'bg.subtle' }}
                    onClick={() => openNote(entry.note.id)}
                    rounded="md"
                    border="1px solid"
                    borderColor="border"
                  >
                    <Box p={1.5} rounded="md" bg="blue.50" color="blue.600" flexShrink={0}>
                      <IconNotes size={14} />
                    </Box>
                    <Text fontSize="sm" noOfLines={1}>{entry.note.title}</Text>
                  </HStack>
                ))}
              </VStack>
            </Card.Body>
          </Card.Root>
        )}
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
