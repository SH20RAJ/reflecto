import React from 'react'

export default function page() {
  return (
    <div>{
        "cdcv" + process.env.AUTH_SECRET
    }</div>
  )
}
