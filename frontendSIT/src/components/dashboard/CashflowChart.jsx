export function CashflowChart({ data }) {
  const width = 640
  const height = 210
  const left = 42
  const right = 16
  const top = 18
  const bottom = 28
  const maxValue = 8
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom

  const pointsFor = (key) =>
    data.map((item, index) => {
      const x = left + (index / (data.length - 1)) * chartWidth
      const y = top + (1 - item[key] / maxValue) * chartHeight
      return [x, y]
    })

  const smoothPath = (points) =>
    points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point[0]} ${point[1]}`
      }

      const previous = points[index - 1]
      const controlDistance = (point[0] - previous[0]) / 2
      return `${path} C ${previous[0] + controlDistance} ${previous[1]}, ${point[0] - controlDistance} ${point[1]}, ${point[0]} ${point[1]}`
    }, '')

  const incomePoints = pointsFor('income')
  const expensePoints = pointsFor('expense')
  const incomeLine = smoothPath(incomePoints)
  const expenseLine = smoothPath(expensePoints)
  const baseline = height - bottom
  const incomeArea = `${incomeLine} L ${width - right} ${baseline} L ${left} ${baseline} Z`
  const expenseArea = `${expenseLine} L ${width - right} ${baseline} L ${left} ${baseline} Z`

  return (
    <article className="min-h-[334px] rounded-xl border border-neutral-300 bg-white p-5 transition duration-200 hover:border-sky-500 hover:shadow-md">
      <div className="flex items-start justify-between gap-4 max-md:flex-wrap">
        <div>
          <h3 className="m-0 text-[15px] font-bold leading-tight text-black">Arus Keuangan</h3>
          <p className="mt-0.5 text-xs text-neutral-600">Pemasukan vs Pengeluaran 6 bulan terakhir</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-600 max-md:flex-wrap">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-sky-600" />
            Pemasukan
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-red-600" />
            Pengeluaran
          </span>
        </div>
      </div>

      <div className="mt-4 h-[235px] w-full" aria-label="Grafik arus keuangan">
        <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#bdbdbd" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#f7f7f7" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#cfcfcf" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f7f7f7" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {[8, 6, 4, 2, 0].map((tick) => {
            const y = top + (1 - tick / maxValue) * chartHeight

            return (
              <g key={tick}>
                <text x="3" y={y + 4} className="fill-black text-[11px]">
                  {tick}jt
                </text>
              </g>
            )
          })}

          <path d={incomeArea} fill="url(#incomeFill)" />
          <path d={expenseArea} fill="url(#expenseFill)" />
          <path d={incomeLine} fill="none" stroke="#d1d1d1" strokeWidth="0" />
          <path d={expenseLine} fill="none" stroke="#d7d7d7" strokeWidth="0" />

          {data.map((item, index) => {
            const x = left + (index / (data.length - 1)) * chartWidth

            return (
              <text key={item.month} x={x} y={height - 8} textAnchor="middle" className="fill-black text-[11px]">
                {item.month}
              </text>
            )
          })}
        </svg>
      </div>
    </article>
  )
}
