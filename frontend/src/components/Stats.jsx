import React from 'react'
import { microSTXToSTX } from '../utils/formatters'
import { SkeletonStats } from './Skeleton'
import './Stats.css'

function Stats({ totalMessages, totalFees, isLoading }) {
  if (isLoading) {
    return <SkeletonStats />
  }

  return (
    <div className="stats">
      <div className="stat-item">
        <span className="stat-label">Total Messages</span>
        <span className="stat-value">
          {totalMessages || 0}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Fees Generated</span>
        <span className="stat-value">
          {`${microSTXToSTX(totalFees || 0)} STX`}
        </span>
      </div>
    </div>
  )
}

export default Stats
