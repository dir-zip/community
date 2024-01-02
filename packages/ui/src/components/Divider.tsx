export const Divider = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="border-t flex-grow" />
      <span className="text-primary-100 px-6">{text}</span>
      <div className="border-t flex-grow" />
    </div>
  )
}
