import React from 'react'

// Simple navigation bar for switching between views.
export default function Navbar({ currentView, onChangeView }) {
  const navItems = [
    { key: 'list', label: 'Recepty' },
    { key: 'custom', label: 'Vlastní drink' },
  ]
  return (
    <nav className="navbar">
      <div className="logo">DrinkMaker</div>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li
            key={item.key}
            className={currentView === item.key ? 'active' : ''}
            onClick={() => onChangeView(item.key)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onChangeView(item.key)
            }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  )
}