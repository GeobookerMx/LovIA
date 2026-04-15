/**
 * LovIA! — Relationship Graph (3 Lines)
 *
 * Recharts AreaChart showing the user's 3 lines over time:
 * Amor (intimacy), Sexual (passion), Realización (commitment).
 *
 * Based on Sternberg's Triangular Theory of Love (1986).
 */

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'

// Mock evolution data (will connect to Supabase in backend phase)
const mockData = [
    { month: 'Ene', amor: 55, sexual: 40, realizacion: 60 },
    { month: 'Feb', amor: 58, sexual: 45, realizacion: 58 },
    { month: 'Mar', amor: 62, sexual: 48, realizacion: 63 },
    { month: 'Abr', amor: 60, sexual: 52, realizacion: 65 },
    { month: 'May', amor: 67, sexual: 55, realizacion: 68 },
    { month: 'Jun', amor: 70, sexual: 58, realizacion: 72 },
    { month: 'Jul', amor: 68, sexual: 62, realizacion: 70 },
    { month: 'Ago', amor: 72, sexual: 60, realizacion: 75 },
]

interface RelationshipGraphProps {
    data?: typeof mockData
    height?: number
}

export default function RelationshipGraph({ data = mockData, height = 280 }: RelationshipGraphProps) {
    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradAmor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B8A" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FF6B8A" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradSexual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(18,18,42,0.95)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px',
                            color: '#F8FAFC',
                            fontSize: '13px',
                            backdropFilter: 'blur(12px)',
                        }}
                        itemStyle={{ color: '#F8FAFC' }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '12px', color: 'rgba(248,250,252,0.6)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="amor"
                        name="❤️ Amor"
                        stroke="#FF6B8A"
                        strokeWidth={2}
                        fill="url(#gradAmor)"
                        dot={{ r: 3, fill: '#FF6B8A' }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#FF6B8A' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="sexual"
                        name="🔥 Sexual"
                        stroke="#A855F7"
                        strokeWidth={2}
                        fill="url(#gradSexual)"
                        dot={{ r: 3, fill: '#A855F7' }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#A855F7' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="realizacion"
                        name="⭐ Realización"
                        stroke="#22D3EE"
                        strokeWidth={2}
                        fill="url(#gradReal)"
                        dot={{ r: 3, fill: '#22D3EE' }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#22D3EE' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
