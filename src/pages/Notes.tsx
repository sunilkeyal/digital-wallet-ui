import { useState, useRef, useEffect } from 'react';
import { Box, Heading, Text, VStack, HStack, Input, Button, IconButton, Flex, Separator, Tooltip, Portal, Dialog, useBreakpointValue } from '@chakra-ui/react';
import { IconNotes, IconEdit, IconCheck, IconX, IconBold, IconItalic, IconList, IconListNumbers, IconHeading, IconQuote, IconGripVertical, IconFolder, IconFolderOpen, IconPlus, IconChevronRight, IconChevronDown, IconChevronLeft, IconSortAscending, IconSortDescending, IconFolders, IconArrowsUpDown, IconTrash } from '@tabler/icons-react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { useNotes, type Note, type NoteGroup } from '../context/NoteContext';
import { noteApi } from '../services/api';
import { useSearchParams } from 'react-router-dom';

const ToolbarButton = ({ onCommand, active, icon, label, compact }: { onCommand: () => void; active?: boolean; icon: React.ReactNode; label: string; compact?: boolean }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onCommand();
  };
  return (
    <IconButton
      aria-label={label}
      size={compact ? 'xs' : 'sm'}
      variant={active ? 'solid' : 'ghost'}
      colorPalette={active ? 'teal' : 'gray'}
      onMouseDown={handleMouseDown}
    >
      {icon}
    </IconButton>
  );
};

const findNote = (groups: NoteGroup[], noteId: string): Note | undefined =>
  groups.flatMap((g) => g.notes).find((n) => n.id === noteId);

const Notes = () => {
  const { groups, setGroups, recordView, createGroup, renameGroup, removeGroup, createNote, updateNote, removeNote, reorderNotes } = useNotes();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('noteExpandedIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem('noteExpandedIds', JSON.stringify([...expandedIds]));
  }, [expandedIds]);

  useEffect(() => {
    if (groups.length === 0) return;
    setExpandedIds((prev) => {
      const ids = new Set(groups.map((g) => g.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [groups]);
  const firstNoteId = groups.length > 0 && groups[0].notes.length > 0 ? groups[0].notes[0].id : null;
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(firstNoteId);
  const [editingContent, setEditingContent] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftGroupName, setDraftGroupName] = useState('');
  const [, setVersion] = useState(0);
  const [groupSortDir, setGroupSortDir] = useState<'asc' | 'desc'>('asc');
  const [noteSortDir, setNoteSortDir] = useState<Record<string, 'asc' | 'desc'>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'group' | 'note'; id: string; name: string } | null>(null);
  const [dragState, setDragState] = useState<{ groupId: string; noteIdx: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ groupId: string; noteIdx: number } | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const editorElRef = useRef<HTMLDivElement>(null);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const [showDetail, setShowDetail] = useState(false);
  const [searchParams] = useSearchParams();

  const selected = findNote(groups, selectedNoteId);

  useEffect(() => {
    const noteId = searchParams.get('noteId');
    if (noteId && findNote(groups, noteId)) {
      setSelectedNoteId(noteId);
      setShowDetail(true);
    }
  }, []);

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setEditingContent(false);
    setEditingTitle(false);
    recordView(noteId);
    if (isMobile) setShowDetail(true);
  };

  useEffect(() => {
    if (!editingContent || !selected) {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      return;
    }
    const editor = new Editor({
      content: selected.content,
      extensions: [StarterKit, TextStyle, FontSize],
      autofocus: 'start',
      onSelectionUpdate: () => setVersion((v) => v + 1),
      onTransaction: () => setVersion((v) => v + 1),
    });
    editorRef.current = editor;
    if (editorElRef.current) {
      editorElRef.current.innerHTML = '';
      editorElRef.current.appendChild(editor.view.dom);
    }
    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [editingContent, selected?.id]);

  const saveContent = async () => {
    if (!selected || !editorRef.current) return;
    const html = editorRef.current.getHTML();
    await updateNote(selected.id, { content: html });
    setEditingContent(false);
  };

  const cancelEditContent = () => setEditingContent(false);
  const startEditContent = () => setEditingContent(true);

  const startEditTitle = () => {
    if (!selected) return;
    setDraftTitle(selected.title);
    setEditingTitle(true);
  };

  const saveTitle = async () => {
    if (!selected || !draftTitle.trim()) return;
    await updateNote(selected.id, { title: draftTitle.trim() });
    setEditingTitle(false);
  };

  const cancelEditTitle = () => { setEditingTitle(false); setDraftTitle(''); };

  const toggleGroup = (groupId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });
  };

  const startEditGroupName = (groupId: string, currentName: string) => {
    setDraftGroupName(currentName);
    setEditingGroupName(groupId);
  };

  const saveGroupName = async () => {
    if (!editingGroupName || !draftGroupName.trim()) return;
    await renameGroup(editingGroupName, draftGroupName.trim());
    setEditingGroupName(null);
    setDraftGroupName('');
  };

  const cancelEditGroupName = () => { setEditingGroupName(null); setDraftGroupName(''); };

  const addGroup = async () => {
    const group = await createGroup('New Group');
    if (group) setExpandedIds((prev) => new Set(prev).add(group.id));
  };

  const deleteGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    setDeleteConfirm({ type: 'group', id: groupId, name: group.name });
  };

  const deleteNote = (noteId: string) => {
    for (const g of groups) {
      const note = g.notes.find((n) => n.id === noteId);
      if (note) {
        setDeleteConfirm({ type: 'note', id: noteId, name: note.title });
        return;
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'group') {
      await removeGroup(deleteConfirm.id);
      if (selectedNoteId && groups.find((g) => g.id === deleteConfirm.id)?.notes.some((n) => n.id === selectedNoteId)) {
        setSelectedNoteId(null);
      }
    } else {
      await removeNote(deleteConfirm.id);
      if (selectedNoteId === deleteConfirm.id) setSelectedNoteId(null);
    }
    setDeleteConfirm(null);
  };

  const addNote = async (groupId: string) => {
    const id = await createNote(groupId);
    if (!id) return;
    setSelectedNoteId(id);
    setEditingContent(true);
    recordView(id);
  };

  return (
    <Box>
      <style>{`
        .note-view em, .note-view i { font-style: italic !important; }
        .note-view strong, .note-view b { font-weight: bold !important; }
        .note-view h3 { font-size: 1.25rem !important; font-weight: bold !important; }
        .note-view ul { list-style-type: disc !important; padding-left: 1.5rem !important; }
        .note-view ol { list-style-type: decimal !important; padding-left: 1.5rem !important; }
        .note-view li { display: list-item !important; }
        .note-delete-btn { opacity: 0 !important; }
        .group:hover .note-delete-btn { opacity: 1 !important; }
      `}</style>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading as="h1" size="lg" mb={1}>Notes</Heading>
          <Text color="gray.500" fontSize="sm">View and manage your personal notes.</Text>
        </Box>
      </Flex>

      <Flex gap={4} h={{ base: 'calc(100vh - 160px)', md: 'calc(100vh - 220px)' }} minH="400px" direction={{ base: 'column', md: 'row' }}>
        {(!isMobile || !showDetail) && (
        <VStack w={{ base: '100%', md: '300px' }} flexShrink={0} gap={3} align="stretch" overflowY="auto" pr={2}>
          <HStack gap={1}>
            <Tooltip.Root openDelay={200}>
              <Tooltip.Trigger asChild>
                <IconButton aria-label="Add Group" size="sm" variant="ghost" onClick={addGroup}><IconPlus size={16} /></IconButton>
              </Tooltip.Trigger>
              <Portal><Tooltip.Positioner><Tooltip.Content>Add Group</Tooltip.Content></Tooltip.Positioner></Portal>
            </Tooltip.Root>
            <Tooltip.Root openDelay={200}>
              <Tooltip.Trigger asChild>
                <IconButton aria-label="Sort Groups" size="sm" variant="ghost" onClick={() => {
                  setGroups((prev) => {
                    const sorted = [...prev].sort((a, b) => groupSortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
                    return sorted;
                  });
                  setGroupSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                }}>
                  {groupSortDir === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                </IconButton>
              </Tooltip.Trigger>
              <Portal><Tooltip.Positioner><Tooltip.Content>{groupSortDir === 'asc' ? 'Sort Groups A-Z' : 'Sort Groups Z-A'}</Tooltip.Content></Tooltip.Positioner></Portal>
            </Tooltip.Root>
            <Tooltip.Root openDelay={200}>
              <Tooltip.Trigger asChild>
                <IconButton aria-label="Collapse All" size="sm" variant="ghost" onClick={() => setExpandedIds(new Set())}><IconChevronRight size={16} /></IconButton>
              </Tooltip.Trigger>
              <Portal><Tooltip.Positioner><Tooltip.Content>Collapse All</Tooltip.Content></Tooltip.Positioner></Portal>
            </Tooltip.Root>
            <Tooltip.Root openDelay={200}>
              <Tooltip.Trigger asChild>
                <IconButton aria-label="Expand All" size="sm" variant="ghost" onClick={() => setExpandedIds(new Set(groups.map((g) => g.id)))}><IconChevronDown size={16} /></IconButton>
              </Tooltip.Trigger>
              <Portal><Tooltip.Positioner><Tooltip.Content>Expand All</Tooltip.Content></Tooltip.Positioner></Portal>
            </Tooltip.Root>
          </HStack>
          {groups.map((group) => {
            const expanded = expandedIds.has(group.id);
            return (
              <Box key={group.id} border="1px solid" borderColor="border" rounded="md">
                <HStack
                  p={2}
                  cursor="pointer"
                  onClick={() => toggleGroup(group.id)}
                  _hover={{ bg: 'bg.subtle' }}
                >
                  {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                  {expanded ? <IconFolderOpen size={16} /> : <IconFolder size={16} />}
                  {editingGroupName === group.id ? (
                    <HStack flex={1} gap={1} onClick={(e) => e.stopPropagation()}>
                      <Input
                        size="xs"
                        value={draftGroupName}
                        onChange={(e) => setDraftGroupName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveGroupName(); if (e.key === 'Escape') cancelEditGroupName(); }}
                        autoFocus
                      />
                      <IconButton aria-label="Save" size="xs" colorPalette="teal" onClick={saveGroupName}><IconCheck size={12} /></IconButton>
                      <IconButton aria-label="Cancel" size="xs" variant="ghost" onClick={cancelEditGroupName}><IconX size={12} /></IconButton>
                    </HStack>
                  ) : (
                    <HStack flex={1}>
                      <Text fontWeight="semibold" fontSize="sm" flex={1}>{group.name}</Text>
                      <IconButton aria-label="Rename" size="2xs" variant="ghost" onClick={(e) => { e.stopPropagation(); startEditGroupName(group.id, group.name); }}><IconEdit size={12} /></IconButton>
                      <IconButton aria-label="Delete group" size="2xs" variant="ghost" colorPalette="red" onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}><IconTrash size={12} /></IconButton>
                    </HStack>
                  )}
                  <IconButton aria-label="Add note" size="2xs" variant="ghost" onClick={(e) => { e.stopPropagation(); addNote(group.id); }}><IconPlus size={12} /></IconButton>
                  <Tooltip.Root openDelay={200}>
                    <Tooltip.Trigger asChild>
                      <IconButton aria-label="Sort notes" size="2xs" variant="ghost" onClick={(e) => {
                        e.stopPropagation();
                        const dir = noteSortDir[group.id] || 'asc';
                        setNoteSortDir((prev) => ({ ...prev, [group.id]: dir === 'asc' ? 'desc' : 'asc' }));
                        setGroups((prev) => prev.map((g) =>
                          g.id === group.id ? { ...g, notes: [...g.notes].sort((a, b) => dir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)) } : g
                        ));
                      }}>
                        <IconArrowsUpDown size={12} />
                      </IconButton>
                    </Tooltip.Trigger>
                    <Portal><Tooltip.Positioner><Tooltip.Content>Sort {(noteSortDir[group.id] || 'asc') === 'asc' ? 'A-Z' : 'Z-A'}</Tooltip.Content></Tooltip.Positioner></Portal>
                  </Tooltip.Root>
                </HStack>

                {expanded && (
                  <VStack gap={1} align="stretch" pb={2}>
                    {group.notes.length === 0 && (
                      <Text px={3} py={2} color="gray.500" fontSize="xs">No notes</Text>
                    )}
                    {group.notes.map((note, idx) => (
                      <Box
                        key={note.id}
                        mx={2}
                        p={2}
                        rounded="md"
                        cursor="pointer"
                        draggable
                        className="group"
                        bg={selectedNoteId === note.id ? 'colorPalette.subtle' : 'transparent'}
                        border="1px solid"
                        borderColor={
                          dropTarget?.groupId === group.id && dropTarget?.noteIdx === idx
                            ? 'colorPalette.fg'
                            : selectedNoteId === note.id ? 'colorPalette.border' : 'transparent'
                        }
                        opacity={dragState?.groupId === group.id && dragState?.noteIdx === idx ? 0.4 : 1}
                        onClick={() => handleSelectNote(note.id)}
                        onDragStart={() => setDragState({ groupId: group.id, noteIdx: idx })}
                        onDragOver={(e) => { e.preventDefault(); setDropTarget({ groupId: group.id, noteIdx: idx }); }}
                        onDragEnd={() => { setDragState(null); setDropTarget(null); }}
                        onDrop={async () => {
                          if (!dragState) return;
                          if (dragState.groupId === group.id && dragState.noteIdx === idx) return;
                          const groupNotes = [...group.notes];
                          const srcGroup = dragState.groupId === group.id ? group : groups.find((g) => g.id === dragState.groupId);
                          const moved = srcGroup?.notes[dragState.noteIdx];
                          if (!moved) { setDragState(null); setDropTarget(null); return; }
                          const srcNotes = dragState.groupId === group.id ? groupNotes : [...(srcGroup?.notes || [])];
                          const [removed] = srcNotes.splice(dragState.noteIdx, 1);
                          const targetNotes = dragState.groupId === group.id ? srcNotes : groupNotes;
                          targetNotes.splice(idx, 0, removed);
                          const updatedGroups = groups.map((g) => {
                            if (g.id === dragState.groupId && g.id === group.id) return { ...g, notes: targetNotes };
                            if (g.id === dragState.groupId) return { ...g, notes: srcNotes };
                            if (g.id === group.id) return { ...g, notes: targetNotes };
                            return g;
                          });
                          setGroups(updatedGroups);
                          await noteApi.reorder(group.id, targetNotes.map((n) => n.id));
                          if (dragState.groupId !== group.id) {
                            await noteApi.update(moved.id, { groupId: group.id } as any);
                            const updatedSrc = updatedGroups.find((g) => g.id === dragState.groupId);
                            if (updatedSrc) {
                              await noteApi.reorder(dragState.groupId, updatedSrc.notes.map((n) => n.id));
                            }
                          }
                          setDragState(null);
                          setDropTarget(null);
                        }}
                        _hover={{ borderColor: 'colorPalette.border' }}
                      >
                        <Flex align="center" gap={2}>
                          <IconGripVertical size={12} style={{ cursor: 'grab', flexShrink: 0, opacity: 0.3 }} />
                          <Text fontSize="xs" noOfLines={1} flex={1}>{note.title}</Text>
                          <Box
                            as="button"
                            aria-label="Delete note"
                            className="note-delete-btn"
                            onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            border="none"
                            bg="transparent"
                            color="red.500"
                            cursor="pointer"
                            p={0.5}
                            rounded="sm"
                            _hover={{ bg: 'red.50' }}
                          >
                            <IconTrash size={10} />
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            );
          })}
        </VStack>
        )}
        {(!isMobile || showDetail) && (
        <Box flex={1} p={{ base: 3, md: 4 }} rounded="md" border="1px solid" borderColor="border" bg="bg.panel" overflowY="auto">
          {isMobile && selected && (
            <HStack mb={3}>
              <IconButton aria-label="Back to list" size="sm" variant="ghost" onClick={() => setShowDetail(false)}>
                <IconChevronLeft size={18} />
              </IconButton>
            </HStack>
          )}
          {selected ? (
            <>
              <HStack mb={3} gap={2}>
                <Box p={2} rounded="lg" bg="colorPalette.subtle" color="colorPalette.fg" flexShrink={0}>
                  <IconNotes size={isMobile ? 16 : 20} />
                </Box>
                {editingTitle ? (
                  <HStack flex={1} gap={2}>
                    <Input
                      size={isMobile ? 'xs' : 'sm'}
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') cancelEditTitle(); }}
                      autoFocus
                    />
                    <IconButton aria-label="Save title" size="xs" colorPalette="teal" onClick={saveTitle}><IconCheck size={14} /></IconButton>
                    <IconButton aria-label="Cancel" size="xs" variant="ghost" onClick={cancelEditTitle}><IconX size={14} /></IconButton>
                  </HStack>
                ) : (
                  <HStack flex={1} minW={0}>
                    <Heading as="h2" size={isMobile ? 'sm' : 'md'} noOfLines={2}>{selected.title}</Heading>
                    <IconButton aria-label="Rename note" size="xs" variant="ghost" onClick={startEditTitle}><IconEdit size={14} /></IconButton>
                  </HStack>
                )}
              </HStack>

              <Text color="gray.500" fontSize={{ base: '2xs', md: 'xs' }} mb={3}>
                Created: {selected.createdAt} &middot; Updated: {selected.updatedAt}
              </Text>

              {editingContent ? (
                <VStack gap={2} align="stretch">
                  <HStack gap={1} wrap="wrap">
                    <select
                      value={editorRef.current?.getAttributes('textStyle').fontSize || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) { editorRef.current?.chain().focus().unsetMark('textStyle').run(); return; }
                        editorRef.current?.chain().focus().setMark('textStyle', { fontSize: val }).run();
                        editorRef.current?.view.focus();
                      }}
                      style={{ fontSize: '0.75rem', border: '1px solid var(--chakra-colors-border)', borderRadius: '0.375rem', background: 'transparent', padding: '0.125rem 0.25rem', cursor: 'pointer' }}
                    >
                      <option value="">Size</option>
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="24px">24px</option>
                      <option value="32px">32px</option>
                    </select>
                    <ToolbarButton
                      label="Bold"
                      icon={isMobile ? <IconBold size={14} /> : <IconBold size={16} />}
                      active={editorRef.current?.isActive('bold')}
                      onCommand={() => editorRef.current?.chain().focus().toggleBold().run()}
                      compact={isMobile}
                    />
                    <ToolbarButton
                      label="Italic"
                      icon={isMobile ? <IconItalic size={14} /> : <IconItalic size={16} />}
                      active={editorRef.current?.isActive('italic')}
                      onCommand={() => editorRef.current?.chain().focus().toggleItalic().run()}
                      compact={isMobile}
                    />
                    <ToolbarButton
                      label="Heading"
                      icon={isMobile ? <IconHeading size={14} /> : <IconHeading size={16} />}
                      active={editorRef.current?.isActive('heading', { level: 3 })}
                      onCommand={() => editorRef.current?.chain().focus().toggleHeading({ level: 3 }).run()}
                      compact={isMobile}
                    />
                    <ToolbarButton
                      label="Bullet List"
                      icon={isMobile ? <IconList size={14} /> : <IconList size={16} />}
                      active={editorRef.current?.isActive('bulletList')}
                      onCommand={() => editorRef.current?.chain().focus().toggleBulletList().run()}
                      compact={isMobile}
                    />
                    <ToolbarButton
                      label="Ordered List"
                      icon={isMobile ? <IconListNumbers size={14} /> : <IconListNumbers size={16} />}
                      active={editorRef.current?.isActive('orderedList')}
                      onCommand={() => editorRef.current?.chain().focus().toggleOrderedList().run()}
                      compact={isMobile}
                    />
                    <ToolbarButton
                      label="Blockquote"
                      icon={isMobile ? <IconQuote size={14} /> : <IconQuote size={16} />}
                      active={editorRef.current?.isActive('blockquote')}
                      onCommand={() => editorRef.current?.chain().focus().toggleBlockquote().run()}
                      compact={isMobile}
                    />
                  </HStack>
                  <Separator />
                  <Box
                    ref={editorElRef}
                    className="note-view"
                    borderWidth="1px"
                    borderColor="border"
                    rounded="md"
                    px={{ base: 2, md: 3 }}
                    py={2}
                    minH={{ base: '120px', md: '200px' }}
                    css={{
                      '& .ProseMirror': { outline: 'none', minH: isMobile ? '100px' : '180px' },
                    }}
                  />
                  <HStack gap={2}>
                    <Button size={isMobile ? 'xs' : 'sm'} colorPalette="teal" onClick={saveContent}><IconCheck size={14} /><Box ml={1}>Save</Box></Button>
                    <Button size={isMobile ? 'xs' : 'sm'} variant="ghost" onClick={cancelEditContent}><IconX size={14} /><Box ml={1}>Cancel</Box></Button>
                  </HStack>
                </VStack>
              ) : (
                <Box>
                  <Box
                    className="note-view"
                    fontSize="sm"
                    lineHeight="1.7"
                    sx={{
                      '& p': { mb: 2 },
                      '& ul': { listStyleType: 'disc', pl: 6, mb: 2, listStylePosition: 'outside' },
                      '& ol': { listStyleType: 'decimal', pl: 6, mb: 2, listStylePosition: 'outside' },
                      '& li': { display: 'list-item', mb: 0.5 },
                      '& strong': { fontWeight: 'bold' },
                      '& em': { fontStyle: 'italic' },
                      '& blockquote': { borderLeft: '3px solid', borderColor: 'colorPalette.border', pl: 3, py: 1, my: 2, color: 'gray.600' },
                    }}
                    dangerouslySetInnerHTML={{ __html: selected.content }}
                  />
                  <Button size={isMobile ? 'xs' : 'sm'} mt={4} colorPalette="teal" onClick={startEditContent}><IconEdit size={14} /><Box ml={1}>Edit</Box></Button>
                </Box>
              )}
            </>
          ) : (
            <Text color="gray.500" fontSize={isMobile ? 'sm' : undefined}>Select a note to view its details.</Text>
          )}
        </Box>
        )}
      </Flex>

      <Dialog.Root open={!!deleteConfirm} onOpenChange={(e) => { if (!e.open) setDeleteConfirm(null); }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete {deleteConfirm?.type === 'group' ? 'Group' : 'Note'}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>
                  Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
                  {deleteConfirm?.type === 'group' && ' All notes in this group will also be deleted.'}
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" mr={3} onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button colorPalette="red" onClick={confirmDelete}>Delete</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default Notes;