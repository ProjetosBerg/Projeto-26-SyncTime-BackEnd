import { GetUserLogin } from '@/presentation/middlewares/getUserLogin'

export const makeGetLoginMiddleware = () => {
  return new GetUserLogin()
}
