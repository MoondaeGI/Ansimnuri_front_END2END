import {create} from 'zustand'

export const useNoteStore = create(set => ({
    noteList: [],
    setNoteList: (noteList) => {
        set({noteList})
    }
}))