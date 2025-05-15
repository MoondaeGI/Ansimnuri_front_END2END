import {create} from 'zustand'

export const useAuthStore = create(set => ({
  token: null,
  userId: null,

  setAuth: (token, loginId) => {
    set({token: token, loginId: loginId})
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('loginId', loginId)
  },

  logout: () => {
    set({token: null, userId: null})
    sessionStorage.removeItem('token')

  },

  initialize: () => {
    const token = sessionStorage.getItem('token')

    if (token) {
      set({token})
    }
  },
}))
