import { atom, AtomEffect } from 'recoil'

const localStorageEffect: (key: string) => AtomEffect<string> =
  (key) =>
  ({ setSelf, onSet }) => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const savedValue = localStorage.getItem(key)
      if (savedValue !== null) {
        setSelf(JSON.parse(savedValue))
      }
    } catch (error) {
      console.error(`Erro ao recuperar ${key} do localStorage:`, error)
      setSelf('')
    }

    onSet((newValue, _, isReset) => {
      try {
        if (isReset) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, JSON.stringify(newValue))
        }
      } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error)
      }
    })
  }

export const userEmailAtom = atom({
  key: 'email',
  default: '',
  effects: [localStorageEffect('current_user_email')],
})

// export const userNameAtom = atom({
//   key: 'name',
//   default: '',
//   effects: [localStorageEffect('current_user_name')],
// })

// export const userNicknameAtom = atom({
//   key: 'nickname',
//   default: '',
//   effects: [localStorageEffect('current_user_nickname')],
// })

export const userPhoneAtom = atom({
  key: 'phone',
  default: '',
  effects: [localStorageEffect('current_user_phone')],
})