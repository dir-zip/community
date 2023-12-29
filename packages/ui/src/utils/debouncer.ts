export default class Debouncer {
  timeout: null | ReturnType<typeof setTimeout>
  n: number
  func: (e:unknown) => Promise<void> 

  constructor(func: (e: unknown) => Promise<void>, n: number) {
    this.timeout = null
    this.n = n || 500
    this.func = func
  }

  execute = (e: any) => {
    this.cancel()
    this.timeout = setTimeout(() => {
      this.func(e)
    }, this.n)
  }

  cancel = () => {
    if (this.timeout) clearTimeout(this.timeout)
  }
}