declare module 'qrcode' {
  const qrcode: {
    toDataURL(text: string, options?: any): Promise<string>
  }
  export default qrcode
}
