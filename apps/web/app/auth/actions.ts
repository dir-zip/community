'use server'
import {auth} from 'apps/web/lib/1up'
import {redirect} from 'next/navigation'

export const logoutAction = async () => {
  await auth.logout()
  redirect('/login')
}

export const loginAction = async ({email, password}: {email:string, password: string}) => {
  const user = await auth.login({email, password})
  return user
}