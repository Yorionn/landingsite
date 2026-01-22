'use client';

import React from 'react';
import type { ProductData } from './types';

interface ProductInfoPanelProps {
  product: ProductData;
  visible: boolean;
  slideOut?: boolean;
  onChangeProduct: (direction: number) => void;
}

export default function ProductInfoPanel({ product, visible, slideOut = false, onChangeProduct }: ProductInfoPanelProps) {
  const getTransform = () => {
    if (slideOut) return 'translateY(-120vh)'; // Уезжает вверх на этапе 3
    if (visible) return 'translateY(0)';       // Видна на этапе 2
    return 'translateY(100%)';                 // Спрятана внизу на этапе 1
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60vh',
        backgroundColor: '#1a1a1a',
        transform: getTransform(),
        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 50px rgba(0,0,0,0.8)',
        zIndex: slideOut ? 5 : 10
      }}
    >
      <div
        style={{
          flex: 1,
          padding: 'clamp(15px, 3vw, 25px)',
          overflow: 'hidden',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.2s'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            color: 'white'
          }}
        >
          {/* Заголовок и цена */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 'clamp(10px, 2vw, 15px)',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
                  fontWeight: 'bold',
                  marginBottom: '0.3rem',
                  lineHeight: 1.2
                }}
              >
                {product.name}
              </h2>
              <p
                style={{
                  fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
                  color: '#888',
                  fontStyle: 'italic'
                }}
              >
                {product.subtitle}
              </p>
            </div>
            <div
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                fontWeight: 'bold',
                color: '#4CAF50',
                textShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
              }}
            >
              {product.price}
            </div>
          </div>

          {/* Описание */}
          <div
            style={{
              marginBottom: 'clamp(12px, 2vw, 18px)'
            }}
          >
            <h3
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#ddd'
              }}
            >
              Description
            </h3>
            <p
              style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)',
                lineHeight: 1.5,
                color: '#aaa'
              }}
            >
              {product.description}
            </p>
          </div>

          {/* Основные характеристики */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(12px, 2vw, 18px)',
              marginBottom: 'clamp(10px, 2vw, 15px)'
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#ddd'
                }}
              >
                Key Features
              </h3>
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
                      fontSize: 'clamp(0.75rem, 1.6vw, 0.85rem)',
                      color: '#aaa',
                      marginBottom: '0.4rem',
                      paddingLeft: '1.3rem',
                      position: 'relative'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        color: '#4CAF50'
                      }}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#ddd'
                }}
              >
                Specifications
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                {product.specifications.slice(0, 5).map((spec, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'clamp(0.75rem, 1.6vw, 0.85rem)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      paddingBottom: '0.3rem'
                    }}
                  >
                    <span style={{ color: '#888' }}>{spec.label}:</span>
                    <span style={{ color: '#ddd', fontWeight: '500' }}>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Кнопка действия */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 'clamp(10px, 2vw, 15px)'
            }}
          >
            <button
              style={{
                padding: 'clamp(10px, 1.8vw, 14px) clamp(25px, 4vw, 40px)',
                fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
                fontWeight: '600',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#45a049';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4CAF50';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
              }}
            >
              View Full Details
            </button>
          </div>
        </div>
      </div>

      {/* Стрелки переключения товаров */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 10
        }}
      >
        <button
          onClick={() => onChangeProduct(-1)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'translateX(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          ‹
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 10
        }}
      >
        <button
          onClick={() => onChangeProduct(1)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
