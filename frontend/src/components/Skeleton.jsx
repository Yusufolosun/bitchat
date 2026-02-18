import React from 'react'
import './Skeleton.css'

export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card-header">
        <div className="skeleton-line skeleton-avatar" />
        <div className="skeleton-line skeleton-time" />
      </div>
      <div className="skeleton-body">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
      <div className="skeleton-card-footer">
        <div className="skeleton-line skeleton-reaction" />
        <div className="skeleton-line skeleton-btn" />
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="skeleton-stats" aria-hidden="true">
      <div className="skeleton-stat-item">
        <div className="skeleton-line skeleton-stat-label" />
        <div className="skeleton-line skeleton-stat-value" />
      </div>
      <div className="skeleton-stat-item">
        <div className="skeleton-line skeleton-stat-label" />
        <div className="skeleton-line skeleton-stat-value" />
      </div>
    </div>
  )
}

export function SkeletonMessageList({ count = 4 }) {
  return (
    <div aria-label="Loading messages" role="status">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
