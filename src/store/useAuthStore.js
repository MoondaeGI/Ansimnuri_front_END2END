import {create} from 'zustand'

export const useAuthStore = create(set => ({
  token: null,
  userId: null,

  setAuth: (token, userId) => {
    set({token: token, userId: userId})
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('userId', userId)
  },

  logout: () => {
    set({token: null, userId: null})
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userId')
  },

  initialize: () => {
    const token = sessionStorage.getItem('token')
    const userId = sessionStorage.getItem('userId')

    if (token && userId) {
      set({token, userId})
    }
  },
}))
