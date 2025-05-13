import {create} from 'zustand'

export const useWebsocketStore = create(set => ({
    noteSocket: null,
    isConnected: false,

    connect: (token) => {
        if (get().socket) {
            get().socket.close()
        }

        const noteWs = new WebSocket('ws://localhost:80/ws/note/' + token)
        noteWs.onopen = () => {
            set({noteSocket: noteWs, isConnected: true})
        }
    },

    disconnect: () => {
        if (get().noteSocket) {
            set({noteSocket: null, isConnected: false})
        }
    }
}))