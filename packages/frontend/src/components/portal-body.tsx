import React from 'react'
import {createPortal} from 'react-dom'

export const PortalBody: React.FC<React.PropsWithChildren> = ({children}) => {
  return createPortal(children, document.body)
}
