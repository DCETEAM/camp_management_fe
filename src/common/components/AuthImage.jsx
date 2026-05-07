import { useState, useEffect, useRef } from 'react'
import { Image as ImageIcon, Loader } from 'lucide-react'

/**
 * Fetches a protected image URL using the stored Bearer token,
 * converts it to a blob object URL, and renders an <img>.
 * Falls back to a placeholder icon on error or while loading.
 */
export default function AuthImage({ src, alt = '', className = '', placeholderClass = '' }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [status, setStatus]   = useState('loading') // loading | ok | error
  const prevUrl = useRef(null)

  useEffect(() => {
    if (!src) { setStatus('error'); return }

    let revoked = false
    setStatus('loading')
    setBlobUrl(null)

    const token = localStorage.getItem('access_token')
    fetch(src, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        if (!res.ok) throw new Error(res.status)
        return res.blob()
      })
      .then(blob => {
        if (revoked) return
        const url = URL.createObjectURL(blob)
        prevUrl.current = url
        setBlobUrl(url)
        setStatus('ok')
      })
      .catch(() => {
        if (!revoked) setStatus('error')
      })

    return () => {
      revoked = true
      if (prevUrl.current) {
        URL.revokeObjectURL(prevUrl.current)
        prevUrl.current = null
      }
    }
  }, [src])

  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${placeholderClass || className}`}>
        <Loader className="w-4 h-4 text-gray-300 animate-spin" />
      </div>
    )
  }

  if (status === 'error' || !blobUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${placeholderClass || className}`}>
        <ImageIcon className="w-5 h-5 text-gray-300" />
      </div>
    )
  }

  return <img src={blobUrl} alt={alt} className={className} />
}
