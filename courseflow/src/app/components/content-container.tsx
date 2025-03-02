import type React from "react"
interface ContentContainerProps {
  children: React.ReactNode
}

export default function ContentContainer({ children }: ContentContainerProps) {
  return <div className="container-custom py-12">{children}</div>
}

