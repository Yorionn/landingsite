'use client';

import React, { useRef, useState } from 'react';
import type { ProductData } from './types';

interface ProductInfoPanelProps {
  product: ProductData;
  visible: boolean;
  onChangeProduct: (direction: number) => void;
}

export default function ProductInfoPanel({ product, visible, onChangeProduct }: ProductInfoPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  const infoTabs = [
    {
      label: 'Описание',
      content: 'Это первая вкладка с информацией о товаре. Здесь будет подробное описание продукта, его особенностей и преимуществ. Текст можно заменить на реальный контент из базы данных.'
    },
    {
      label: 'Характеристики',
      content: 'Вторая вкладка содержит технические характеристики товара. Здесь можно указать размеры, материалы, вес и другие важные параметры продукта.'
    },
    {
      label: 'Доставка',
      content: 'Третья вкладка с информацией о доставке. Описание условий доставки, сроков, стоимости и доступных регионов для отправки товара.'
    }
  ];

  return (
    <div
      ref={panelRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '60vh',
        backgroundColor: '#1a1a1a',
        display: visible ? 'flex' : 'none',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          flex: 1,
          padding: 'clamp(15px, 3vw, 25px)',
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
          {/* 1. Краткая карточка товара (сохранена) */}
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
              Описание
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

          {/* Характеристики */}
          <div
            style={{
              marginBottom: 'clamp(30px, 5vw, 50px)'
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
              Характеристики
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

          {/* 2. Разделитель страницы */}
          <div
            style={{
              height: '200px',
              backgroundColor: '#2a2a2a',
              borderRadius: '10px',
              marginBottom: 'clamp(30px, 5vw, 50px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)'
            }}
          >
            [Placeholder для изображения]
          </div>

          {/* 3. Второй блок информации */}
          <div style={{ marginBottom: 'clamp(30px, 5vw, 50px)' }}>
            {/* 3.1. Заголовок */}
            <h3
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontWeight: '600',
                marginBottom: 'clamp(20px, 3vw, 30px)',
                color: '#fff'
              }}
            >
              Подробная информация
            </h3>

            {/* 3.2. Кнопки переключения */}
            <div
              style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}
            >
              {infoTabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  style={{
                    padding: 'clamp(10px, 2vw, 15px) clamp(20px, 3vw, 30px)',
                    fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
                    fontWeight: '600',
                    backgroundColor: activeTab === index ? '#4CAF50' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: activeTab === index ? 'none' : '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== index) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== index) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 3.3. Переключаемый текст */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '10px',
                padding: 'clamp(20px, 3vw, 30px)',
                minHeight: '150px'
              }}
            >
              <p
                style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  lineHeight: 1.6,
                  color: '#ccc'
                }}
              >
                {infoTabs[activeTab].content}
              </p>
            </div>
          </div>

          {/* 4. Разделитель страницы */}
          <div
            style={{
              height: '200px',
              backgroundColor: '#2a2a2a',
              borderRadius: '10px',
              marginBottom: 'clamp(30px, 5vw, 50px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)'
            }}
          >
            [Placeholder для изображения]
          </div>

          {/* 5. Форма предзаказа */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '15px',
              padding: 'clamp(25px, 4vw, 40px)',
              marginBottom: 'clamp(30px, 5vw, 50px)'
            }}
          >
            <h3
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontWeight: '600',
                marginBottom: 'clamp(20px, 3vw, 30px)',
                color: '#fff'
              }}
            >
              Форма предзаказа
            </h3>

            <form
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Поле для email */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    color: '#ddd'
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="example@mail.com"
                  style={{
                    width: '100%',
                    padding: 'clamp(12px, 2vw, 15px)',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#4CAF50';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                />
              </div>

              {/* Выпадающий список */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    color: '#ddd'
                  }}
                >
                  Выберите вариант
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: 'clamp(12px, 2vw, 15px)',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#4CAF50';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  <option value="option1" style={{ backgroundColor: '#1a1a1a' }}>Вариант 1</option>
                  <option value="option2" style={{ backgroundColor: '#1a1a1a' }}>Вариант 2</option>
                  <option value="option3" style={{ backgroundColor: '#1a1a1a' }}>Вариант 3</option>
                </select>
              </div>

              {/* Текстовое поле */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    color: '#ddd'
                  }}
                >
                  Комментарий
                </label>
                <textarea
                  placeholder="Введите ваш комментарий..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 'clamp(12px, 2vw, 15px)',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#4CAF50';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                />
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                style={{
                  padding: 'clamp(12px, 2vw, 16px)',
                  fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                  fontWeight: '600',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#45a049';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Отправить заявку
              </button>
            </form>
          </div>

          {/* 6. Разделитель страницы */}
          <div
            style={{
              height: '200px',
              backgroundColor: '#2a2a2a',
              borderRadius: '10px',
              marginBottom: 'clamp(30px, 5vw, 50px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)'
            }}
          >
            [Placeholder для изображения]
          </div>

          {/* 7. Блок "О нас" */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '15px',
              padding: 'clamp(25px, 4vw, 40px)',
              marginBottom: 'clamp(30px, 5vw, 50px)'
            }}
          >
            <h3
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontWeight: '600',
                marginBottom: 'clamp(15px, 2.5vw, 25px)',
                color: '#fff'
              }}
            >
              О нас
            </h3>
            <p
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                lineHeight: 1.8,
                color: '#bbb'
              }}
            >
              Мы — команда профессионалов, которая занимается созданием качественных продуктов. 
              Наша цель — предоставить вам лучший сервис и товары высочайшего качества. 
              С нами вы всегда можете быть уверены в надежности и долговечности наших изделий. 
              Мы ценим каждого клиента и стремимся сделать ваш опыт покупки максимально комфортным.
            </p>
          </div>

          {/* 8. Разделитель страницы */}
          <div
            style={{
              height: '200px',
              backgroundColor: '#2a2a2a',
              borderRadius: '10px',
              marginBottom: 'clamp(30px, 5vw, 50px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)'
            }}
          >
            [Placeholder для изображения]
          </div>

          {/* 9. Блок "Контактные данные" */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '15px',
              padding: 'clamp(25px, 4vw, 40px)',
              marginBottom: 'clamp(30px, 5vw, 50px)'
            }}
          >
            <h3
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontWeight: '600',
                marginBottom: 'clamp(15px, 2.5vw, 25px)',
                color: '#fff'
              }}
            >
              Контактные данные
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                color: '#bbb'
              }}
            >
              <div>
                <strong style={{ color: '#fff' }}>Email:</strong> info@example.com
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Телефон:</strong> +7 (999) 123-45-67
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Адрес:</strong> г. Москва, ул. Примерная, д. 123
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Режим работы:</strong> Пн-Пт: 9:00 - 18:00
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
