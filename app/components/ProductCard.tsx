'use client';

import React from 'react';
import type { ProductData } from './types';

interface ProductCardProps {
  product: ProductData;
  onChangeProduct: (direction: number) => void;
}

export default function ProductCard({ product, onChangeProduct }: ProductCardProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        overflowY: 'auto',
        animation: 'slideUpFromBottom 1s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: 'clamp(20px, 4vw, 40px)',
        zIndex: 3
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          color: 'white'
        }}
      >
        {/* Верхний блок с изображением и основной информацией */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(30px, 5vw, 60px)',
            marginBottom: 'clamp(40px, 6vw, 80px)'
          }}
        >
          {/* Изображение товара */}
          <div
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '20px',
              padding: 'clamp(30px, 5vw, 50px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px'
              }}
            >
              {/* Placeholder для изображения */}
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '80px',
                  border: '2px solid rgba(255,255,255,0.1)'
                }}
              >
                🖼️
              </div>
              <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
                Product Image / Photo Gallery
              </p>
            </div>
          </div>

          {/* Основная информация */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 'bold',
                marginBottom: '1rem',
                lineHeight: 1.2
              }}
            >
              {product.name}
            </h1>
            <p
              style={{
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                color: '#888',
                fontStyle: 'italic',
                marginBottom: '2rem'
              }}
            >
              {product.subtitle}
            </p>
            
            <div
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontWeight: 'bold',
                color: '#4CAF50',
                marginBottom: '2rem',
                textShadow: '0 0 30px rgba(76, 175, 80, 0.3)'
              }}
            >
              {product.price}
            </div>

            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                lineHeight: 1.8,
                color: '#ccc',
                marginBottom: '2rem'
              }}
            >
              {product.description}
            </p>

            {/* Кнопки действий */}
            <div
              style={{
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap'
              }}
            >
              <button
                style={{
                  padding: 'clamp(14px, 2.5vw, 18px) clamp(35px, 6vw, 60px)',
                  fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                  fontWeight: '600',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#45a049';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                }}
              >
                Add to Cart
              </button>
              
              <button
                style={{
                  padding: 'clamp(14px, 2.5vw, 18px) clamp(35px, 6vw, 60px)',
                  fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Подробные характеристики */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(25px, 4vw, 40px)',
            marginBottom: 'clamp(40px, 6vw, 80px)'
          }}
        >
          {/* Ключевые особенности */}
          <div
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '15px',
              padding: 'clamp(25px, 4vw, 35px)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: '#fff',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '0.8rem'
              }}
            >
              Key Features
            </h2>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}
            >
              {product.features.map((feature, index) => (
                <li
                  key={index}
                  style={{
                    fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                    color: '#bbb',
                    marginBottom: '1rem',
                    paddingLeft: '2rem',
                    position: 'relative',
                    lineHeight: 1.6
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      color: '#4CAF50',
                      fontSize: '1.3rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Технические характеристики */}
          <div
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '15px',
              padding: 'clamp(25px, 4vw, 35px)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                fontWeight: '600',
                marginBottom: '1.5rem',
                color: '#fff',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '0.8rem'
              }}
            >
              Specifications
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {product.specifications.map((spec, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '0.8rem'
                  }}
                >
                  <span style={{ color: '#888', fontWeight: '500' }}>{spec.label}:</span>
                  <span style={{ color: '#ddd', fontWeight: '600' }}>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* График/Инфографика placeholder */}
        <div
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '20px',
            padding: 'clamp(30px, 5vw, 50px)',
            marginBottom: 'clamp(40px, 6vw, 80px)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              fontWeight: '600',
              marginBottom: '2rem',
              color: '#fff',
              textAlign: 'center'
            }}
          >
            Product Analytics & Comparison
          </h2>
          <div
            style={{
              width: '100%',
              height: '300px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '60px', marginBottom: '10px' }}>📊</div>
              <p style={{ fontSize: '1.1rem' }}>Charts & Graphs Placeholder</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Performance data, comparisons, ratings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Стрелки навигации */}
      <button
        onClick={() => onChangeProduct(-1)}
        style={{
          position: 'fixed',
          left: '30px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.3)',
          color: 'white',
          fontSize: '30px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'translateY(-50%) translateX(-5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
        }}
      >
        ‹
      </button>

      <button
        onClick={() => onChangeProduct(1)}
        style={{
          position: 'fixed',
          right: '30px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.3)',
          color: 'white',
          fontSize: '30px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'translateY(-50%) translateX(5px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
        }}
      >
        ›
      </button>

      <style jsx>{`
        @keyframes slideUpFromBottom {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
