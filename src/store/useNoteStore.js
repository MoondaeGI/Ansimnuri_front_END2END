import {create} from 'zustand'

export const useNoteStore = create((set, get) => ({
    socket: null,
    noteList: [],

    initialize: () => {
        const noteList = JSON.parse(sessionStorage.getItem('noteList'));
        if(noteList) {
            set({noteList: noteList})
        }

        if (!get().socket) {
            const ws = new WebSocket(`ws://localhost:80/ws/note`)
            ws.onopen = () => {
                console.log('connect')
                set({socket: ws})
            }

            ws.onmessage = (event) => {
                get().message(event)
            }
        }
    },

    setNoteList: (noteList) => {
        set({noteList: noteList})
        sessionStorage.setItem('noteList', JSON.stringify(noteList))
    },

    connect: () => {
        if (!get().socket) {
            const ws = new WebSocket(`ws://localhost:80/ws/note`)
            ws.onopen = () => {
                console.log('connect')
                set({socket: ws})
            }

            ws.onmessage = (event) => {
                get().message(event)
            }
        }
    },

    disconnect: () => {
        set({socket: null})
    },

    message: (event) => {
        const {requestType, requesterId, noteDTO} = JSON.parse(event.data)
        console.log(requestType, requesterId, noteDTO)

        switch (requestType) {
            case 'INSERT':
                set(prev => ({
                    noteList: [...prev.noteList, noteDTO]
                }))
                break
            case 'UPDATE':
                console.log("업데이트!")
                set(prev => ({
                    noteList: prev.noteList
                        .map(note => (note.id === Number(noteDTO.id)) ? noteDTO : note)
                }))
                sessionStorage.setItem('noteList', JSON.stringify(get().noteList))
                console.log(JSON.stringify(get().noteList))
                break
            case 'DELETE':
                set(prev => ({
                    noteList: prev.noteList
                        .filter(note => note.id !== noteDTO.id)
                }))
                break
        }
    }
}))