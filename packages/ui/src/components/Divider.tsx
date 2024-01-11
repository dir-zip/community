export const Divider = ({ text, component }: { text?: string, component?: JSX.ElementType }) => {
  const Component = component
  return (
    <div className="flex w-full items-center justify-center">
      <div className="border-t flex-grow" />
      {component ? <Component /> : <span className="text-primary-100 px-6">{text}</span>}
      <div className="border-t flex-grow" />
    </div>
  )
}
