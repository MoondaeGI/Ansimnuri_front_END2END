import {create} from 'zustand'

export const useWebsocketStore = create(set => ({
    socket: null,
    isConnected: false,

    connect: (token) => {
        if (get().socket) {
            get().socket.close()
        }

        const ws = new WebSocket('ws://localhost:80/ws/note/' + token)
        ws.onopen = () => {
            set({isConnected: true})
        }
        set({socket: ws})
    },
}))