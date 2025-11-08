"use client";

import React from 'react';

export default function TestUbicacionesPage() {
  console.log("TestUbicacionesPage rendering...");

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'red',
      padding: '20px',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1>TEST UBIACIONES PAGE</h1>
      <p>If you can see this, the page is rendering!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}