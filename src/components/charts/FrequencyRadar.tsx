/**
 * LovIA! — Frequency Radar Chart (6 axes)
 *
 * Recharts RadarChart showing the user's 6 core dimensions:
 * Comunicación, Valores, Sexualidad, Metas, Afecto, Resolución.
 *
 * Based on Gottman's research on relationship dimensions and
 * factor analysis from the LovIA! scoring engine.
 */

import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Radar, ResponsiveContainer, Tooltip,
} from 'recharts'

// Mock scores (0-100 per axis)
const mockRadarData = [
    { axis: 'Comunicación', score: 72, fullMark: 100 },
    { axis: 'Valores', score: 85, fullMark: 100 },
    { axis: 'Sexualidad', score: 58, fullMark: 100 },
    { axis: 'Metas', score: 68, fullMark: 100 },
    { axis: 'Afecto', score: 75, fullMark: 100 },
    { axis: 'Resolución', score: 62, fullMark: 100 },
]

interface FrequencyRadarProps {
    data?: typeof mockRadarData
    size?: number
    showTooltip?: boolean
}

export default function FrequencyRadar({
    data = mockRadarData,
    size = 280,
    showTooltip = true,
}: FrequencyRadarProps) {
    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={size}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid
                        stroke="rgba(255,255,255,0.08)"
                        gridType="polygon"
                    />
                    <PolarAngleAxis
                        dataKey="axis"
                        tick={{
                            fill: 'rgba(248,250,252,0.6)',
                            fontSize: 11,
                            fontWeight: 500,
                        }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: 'rgba(248,250,252,0.3)', fontSize: 10 }}
                        axisLine={false}
                    />
                    <Radar
                        name="Tu Frecuencia"
                        dataKey="score"
                        stroke="#A855F7"
                        strokeWidth={2}
                        fill="#A855F7"
                        fillOpacity={0.2}
                        dot={{ r: 4, fill: '#A855F7', stroke: '#A855F7', strokeWidth: 1 }}
                    />
                    {showTooltip && (
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(18,18,42,0.95)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '12px',
                                color: '#F8FAFC',
                                fontSize: '13px',
                                backdropFilter: 'blur(12px)',
                            }}
                            formatter={(value: any) => [`${value}/100`, 'Score']}
                        />
                    )}
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}
