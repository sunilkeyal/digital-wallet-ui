import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, ReactNode } from 'react';
import { noteGroupApi, noteApi } from '../services/api';
import type { NoteDto, NoteGroupDto } from '../types';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteGroup {
  id: string;
  name: string;
  notes: Note[];
}

interface RecentNoteEntry {
  note: Note;
  groupName: string;
  viewedAt: string;
}

interface NoteContextType {
  groups: NoteGroup[];
  setGroups: React.Dispatch<React.SetStateAction<NoteGroup[]>>;
  recentNotes: RecentNoteEntry[];
  recordView: (noteId: string) => void;
  refreshGroups: () => Promise<void>;
  createGroup: (name: string) => Promise<NoteGroup | null>;
  renameGroup: (id: string, name: string) => Promise<void>;
  removeGroup: (id: string) => Promise<void>;
  createNote: (groupId: string, title?: string) => Promise<string | null>;
  updateNote: (noteId: string, data: Partial<Note>) => Promise<void>;
  removeNote: (noteId: string) => Promise<void>;
  reorderNotes: (groupId: string, noteIds: string[]) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | null>(null);

const mapNoteDto = (dto: NoteDto): Note => ({
  id: dto.id!,
  title: dto.title,
  content: dto.content,
  createdAt: dto.createdAt || '',
  updatedAt: dto.updatedAt || '',
});

const mapGroupDto = (dto: NoteGroupDto): NoteGroup => ({
  id: dto.id!,
  name: dto.name,
  notes: (dto.notes || []).map(mapNoteDto),
});

let nextNoteId = 100;
let nextGroupId = 100;

const loadRecent = async (groups: NoteGroup[]): Promise<RecentNoteEntry[]> => {
  try {
    const res = await noteApi.getRecent();
    return res.data.map((dto) => {
      const note = mapNoteDto(dto);
      const group = groups.find((g) => g.id === dto.groupId);
      return { note, groupName: group?.name || '', viewedAt: dto.viewedAt || note.updatedAt };
    });
  } catch {
    return [];
  }
};

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<NoteGroup[]>([]);
  const [recentNotes, setRecentNotes] = useState<RecentNoteEntry[]>([]);
  const loadedRef = useRef(false);

  const refreshGroups = useCallback(async () => {
    try {
      const res = await noteGroupApi.getAll();
      const mapped = res.data.map(mapGroupDto);
      setGroups(mapped);
      const recent = await loadRecent(mapped);
      setRecentNotes(recent);
      return mapped;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    refreshGroups();
  }, [refreshGroups]);

  const recordView = useCallback(async (noteId: string) => {
    try {
      await noteApi.recordView(noteId);
    } catch {}
    const recent = await loadRecent(groups);
    setRecentNotes(recent);
  }, [groups]);

  const createGroup = useCallback(async (name: string): Promise<NoteGroup | null> => {
    try {
      const res = await noteGroupApi.create({ name });
      const group: NoteGroup = { id: res.data.id!, name: res.data.name, notes: [] };
      setGroups((prev) => [...prev, group]);
      return group;
    } catch { return null; }
  }, []);

  const renameGroup = useCallback(async (id: string, name: string) => {
    try {
      await noteGroupApi.update(id, { name });
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));
    } catch {}
  }, []);

  const removeGroup = useCallback(async (id: string) => {
    try {
      await noteGroupApi.delete(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch {}
  }, []);

  const createNote = useCallback(async (groupId: string, title?: string): Promise<string | null> => {
    try {
      const dto: NoteDto = { title: title || 'New Note', content: '<p></p>', groupId };
      const res = await noteApi.create(dto);
      const note: Note = mapNoteDto(res.data);
      setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, notes: [...g.notes, note] } : g)));
      return note.id;
    } catch { return null; }
  }, []);

  const updateNote = useCallback(async (noteId: string, data: Partial<Note>) => {
    try {
      const dto: Record<string, unknown> = {};
      if (data.title !== undefined) dto.title = data.title;
      if (data.content !== undefined) dto.content = data.content;
      await noteApi.update(noteId, dto as NoteDto);
      setGroups((prev) => prev.map((g) => ({
        ...g,
        notes: g.notes.map((n) => (n.id === noteId ? { ...n, ...data } : n)),
      })));
    } catch {}
  }, []);

  const removeNote = useCallback(async (noteId: string) => {
    try {
      await noteApi.delete(noteId);
      setGroups((prev) => prev.map((g) => ({
        ...g,
        notes: g.notes.filter((n) => n.id !== noteId),
      })));
    } catch {}
  }, []);

  const reorderNotes = useCallback(async (groupId: string, noteIds: string[]) => {
    try {
      await noteApi.reorder(groupId, noteIds);
      setGroups((prev) => prev.map((g) => {
        if (g.id !== groupId) return g;
        const reordered = noteIds.map((id) => g.notes.find((n) => n.id === id)).filter(Boolean) as Note[];
        return { ...g, notes: reordered };
      }));
    } catch {}
  }, []);

  return (
    <NoteContext.Provider value={{ groups, setGroups, recentNotes, recordView, refreshGroups, createGroup, renameGroup, removeGroup, createNote, updateNote, removeNote, reorderNotes }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const ctx = useContext(NoteContext);
  if (!ctx) throw new Error('useNotes must be used within a NoteProvider');
  return ctx;
};
