import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, currentUser, userRole, requiredRole }) {
  if (!currentUser) return <Navigate to="/login" replace />
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" replace />
  return children
}