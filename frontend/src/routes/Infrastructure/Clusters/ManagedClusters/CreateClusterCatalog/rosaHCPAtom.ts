import { atom } from 'recoil'
import { Secret } from '../../../../../resources'
export const selectedServiceAccountState = atom<Secret | undefined>({
  key: 'selectedServiceAccountState',
  default: undefined,
})