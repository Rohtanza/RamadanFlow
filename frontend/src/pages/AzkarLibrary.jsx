import React, { useState, useEffect, useRef } from 'react'
import { fetchAzkar } from '../services/azkarService'
import html2pdf from 'html2pdf.js'
import NavBar from '../components/NavBar' // Import your navbar

const CATEGORIES = [
  { key: 'm',  label: 'Morning Adhkar' },
{ key: 'e',  label: 'Evening Adhkar' },
{ key: 'as', label: 'Post-Prayer Adhkar' }
]

export default function AzkarLibrary() {
  const { setCategory, category, items, loading, error, pdfRef } = useAzkarLogic()

  const downloadPDF = () => {
    const title = CATEGORIES.find(c => c.key === category).label
    const element = pdfRef.current
    if (!element) return

      html2pdf()
      .set({
        margin: 10,
        filename: `${title.replace(/\s+/g, '_')}.pdf`,
           image: { type: 'jpeg', quality: 0.98 },
           html2canvas: { scale: 2, useCORS: true },
           jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait' }
      })
      .from(element)
      .save()
      .catch(err => {
        console.error('PDF export error', err)
        alert('Could not generate PDF.')
      })
  }

  return (
    <>
    <NavBar /> {/* Inject NavBar at the top */}
    <div
    className="min-h-screen w-full relative flex items-center justify-center bg-cover bg-center pt-20"
    style={{
      backgroundImage: "url('/home-back.jpg')",
          fontFamily: "'Poppins', sans-serif"
    }}
    >
    {/* Dark gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-black/70" />

    {/* Content container */}
    <div className="relative z-10 w-full max-w-4xl p-10 bg-gray-800 bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl space-y-8">
    <h2 className="text-4xl md:text-5xl font-bold text-white text-center">
    Azkar Library
    </h2>

    {/* Category Buttons */}
    <div className="flex flex-wrap justify-center gap-4">
    {CATEGORIES.map(cat => (
      <button
      key={cat.key}
      onClick={() => setCategory(cat.key)}
      className={
        `px-6 py-3 rounded-full font-medium transition-colors duration-300 ` +
        (category === cat.key
        ? 'bg-yellow-500 text-gray-900 shadow-lg'
        : 'bg-gray-600 text-gray-200 hover:bg-gray-500')
      }
      >
      {cat.label}
      </button>
    ))}
    </div>

    {/* Loading / Error */}
    {loading && <p className="text-center text-gray-300 text-xl">Loading Azkar...</p>}
    {error && <p className="text-center text-red-400 text-xl">{error}</p>}

    {/* Entries & PDF button */}
    {!loading && !error && (
      <>
      <div className="flex justify-between items-center">
      <h3 className="text-3xl font-semibold text-white">
      {CATEGORIES.find(c => c.key === category).label}
      </h3>
      <button
      onClick={downloadPDF}
      className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium shadow-lg transition duration-300"
      >
      Download PDF
      </button>
      </div>

      {/* List of Azkar */}
      <div
      ref={pdfRef}
      className="overflow-y-auto max-h-[60vh] space-y-6 no-scrollbar"
      style={{ direction: 'rtl' }}
      >
      {items.length === 0 ? (
        <p className="text-center text-gray-300 text-xl">No entries found.</p>
      ) : (
        items.map((itm, idx) => {
          const text = typeof itm === 'string'
          ? itm
          : itm.content || itm.zikr || itm.text || JSON.stringify(itm)

          const repeat = typeof itm === 'object' ? itm.repeat || '' : ''
          const bless = typeof itm === 'object' ? itm.bless || '' : ''

          return (
            <div key={idx} className="bg-gray-700 bg-opacity-80 p-6 rounded-2xl shadow-inner text-right">
            <p className="text-white text-2xl font-medium mb-3">
            <span className="text-yellow-400 ml-2">{idx + 1}.</span> {text}
            </p>
            {(repeat || bless) && (
              <div className="flex flex-wrap gap-4 justify-end">
              {repeat && <span className="text-gray-300 text-lg">التكرار: <strong>{repeat}×</strong></span>}
              {bless && <span className="text-gray-300 text-lg">ملاحظة: <em>{bless}</em></span>}
              </div>
            )}
            </div>
          )
        })
      )}
      </div>
      </>
    )}
    </div>
    </div>
    </>
  )
}

// Encapsulated hook logic for clarity
function useAzkarLogic() {
  const [category, setCategory] = useState('m')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pdfRef = useRef()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchAzkar(category)
    .then(data => {
      if (!cancelled) setItems(Array.isArray(data) ? data : [])
    })
    .catch(err => {
      console.error(err)
      if (!cancelled) setError('Failed to load Azkar')
    })
    .finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [category])

  return { category, setCategory, items, loading, error, pdfRef }
}
