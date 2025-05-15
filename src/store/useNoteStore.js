import {create} from 'zustand'

export const useNoteStore = create((set, get) => ({
    socket: null,
    noteList: [],

    initialize: () => {
        const noteList = sessionStorage.getItem('noteList')
        if(noteList) {
            set({noteList: noteList})
        }

        if (!get().socket) {
            const ws = new WebSocket(`ws://localhost:80/ws/note`)
            ws.onopen = () => {
                console.log('connect')
                set({socket: ws})
            }
        }
    },

    setNoteList: (noteList) => {
        set({noteList: noteList})
        sessionStorage.setItem('noteList', noteList)
    },

    connect: () => {
        const ws = new WebSocket(`ws://localhost:80/ws/note`)
        ws.onopen = () => {
            console.log('connect')
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

            switch (requestType) {
                case 'INSERT':
                    set(prev => ({
                        noteList: [...prev.noteList, noteDTO]
                    }))
                    break
                case 'UPDATE':
                    set(prev => ({
                        noteList: prev.noteList
                            .map(note => (note.id === noteDTO.id) ? noteDTO : note)
                    }))
                    break
                case 'DELETE':
                    set(prev => ({
                        noteList: prev.noteList
                            .filter(note => note.id !== noteDTO.id)
                    }))
                    break
            }
        }
    }
}))