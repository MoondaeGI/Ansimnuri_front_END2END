import {create} from 'zustand'

export const useNoteStore = create((set, get) => ({
    socket: null,
    noteList: [],

    initialize: () => {
        const noteList = sessionStorage.getItem('noteList')
        if(noteList) {
            set({noteList: noteList})
        }
    },

    setNoteList: (noteList) => {
        set({noteList: noteList})
        sessionStorage.setItem('noteList', noteList)
    },

    connect: (token) => {
        const ws = new WebSocket(`ws://localhost:80/note/${token}`)
        ws.onopen = () => {
            set({socket: ws})
        }
    },

    disconnect: () => {
        set({socket: null})
    },

    message: () => {
        get().socket.onmessage = (event) => {
            const {requestType, requesterId, noteDTO} = event.data
            console.log(requestType, requesterId, noteDTO)
        }
    },

    insert: (dto) => {
        set(prev => ({
            noteList: [...prev.noteList, dto]
        }))
    },

    update: (dto) => {
        set(prev => ({
            noteList: prev.noteList.map(note => (note.id == dto.id) ? dto : note)
        }))
    },

    delete: (dto) => {
        set(prev => ({
            noteList: prev.noteList.filter(note => note.id != dto.id)
        }))
    }
}))