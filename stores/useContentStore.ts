import { create } from 'zustand'
import type { ContentStatus, Platform, ContentType } from '@/types'

interface ContentStore {
  selectedStatus: ContentStatus | 'ALL'
  selectedPlatform: Platform | 'ALL'
  selectedType: ContentType | 'ALL'
  setFilter: (
    key: 'selectedStatus' | 'selectedPlatform' | 'selectedType',
    value: string
  ) => void
  resetFilters: () => void
}

export const useContentStore = create<ContentStore>((set) => ({
  selectedStatus: 'ALL',
  selectedPlatform: 'ALL',
  selectedType: 'ALL',
  setFilter: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),
  resetFilters: () =>
    set({
      selectedStatus: 'ALL',
      selectedPlatform: 'ALL',
      selectedType: 'ALL',
    }),
}))
