import React, { useEffect, useState } from 'react';
import ModelViewer from './components/ModelViewer';
import ErrorBoundary from './ErrorBoundary';
import modelConfig from './config/modelConfig';
import './App.css';
import { animate } from 'animejs'; // 引入 Anime.js 4.0 的 animate 函数

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState('初始化中');
  const [renderAttempt, setRenderAttempt] = useState(0);

  // 添加动画文本 - 转换为全大写
  const text = 'Saitama LOVE Baos';

  // 设置网站角标和标题
  useEffect(() => {
    // 设置网站角标为 head.png
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = '/head.png';
    document.getElementsByTagName('head')[0].appendChild(link);
    
    // 设置网站标题
    document.title = "琦玉loveBaos";
  }, []);

  useEffect(() => {
    console.log(`当前状态: 加载=${isLoading}, 错误=${error}, 模型状态=${modelStatus}`);
  }, [isLoading, error, modelStatus]);

  // 使用 Anime.js 4.0 的 animate 函数实现文本动画，不再依赖isLoading状态
  useEffect(() => {
    animate('span.char', {
      y: [
        { to: '-2.75rem', ease: 'outExpo', duration: 600 },
        { to: 0, ease: 'outBounce', duration: 800, delay: 100 }
      ],
      rotate: {
        from: '-1turn',
        delay: 0
      },
      delay: (_, i) => i * 50,
      ease: 'inOutCirc',
      loopDelay: 1000,
      loop: true
    });
  }, []); // 仅在组件挂载时运行一次

  useEffect(() => {
    if (renderAttempt > 0) {
      console.log(`尝试重新加载模型，第 ${renderAttempt} 次尝试`);
      setIsLoading(true);
      setError(null);
      setModelStatus('重新加载中');
    }
  }, [renderAttempt]);

  const handleModelLoad = () => {
    console.log('模型加载成功！');
    setModelStatus('加载完成');
    setIsLoading(false);
  };

  const handleModelError = (err) => {
    console.error("模型加载失败:", err);
    setModelStatus('加载失败');
    
    let errorMessage = "3D模型加载失败";
    
    if (err.customMessage) {
      errorMessage = err.customMessage;
    } else if (err.message && err.message.includes('<!doctype')) {
      errorMessage = "服务器无法找到模型文件";
    }
    
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setRenderAttempt(prev => prev + 1);
  };

  return (
    <div className="App" style={{ 
      background: '#000000',
      width: '100vw',       // 使用视口宽度
      height: '100vh',      // 使用视口高度
      overflow: 'hidden',   // 防止滚动条
      margin: 0,
      padding: 0,
      position: 'fixed',    // 修复白边问题
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <div className="background" style={{ backgroundColor: '#000000' }}></div>
      
      {/* 动画文本移到页面顶部，调整大小和位置 */}
      <div style={{ 
        position: 'absolute', 
        top: '50px',    // 向下移动
        left: 0, 
        width: '100%', 
        zIndex: 100, 
        padding: '10px 0'
      }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', color: '#facc15' }}>
          {text.split('').map((char, index) => (
            <span key={index} className="char" style={{ display: 'inline-block' }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>
      
      {/* 添加左下角社交媒体链接 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>
          {/* Baos Twitter */}
          <a href="https://x.com/baosonbnb" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            textDecoration: 'none',
            marginBottom: '8px'
          }}>
            <img src="/twitter-icon.png" alt="Twitter" style={{ width: '20px', marginRight: '8px' }} />
            <span>baos.world 推特</span>
          </a>
          
          {/* Baos Telegram */}
          <a href="https://t.me/BaosZH" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            textDecoration: 'none',
            marginBottom: '8px'
          }}>
            <img src="/telegram-icon.png" alt="Telegram" style={{ width: '20px', marginRight: '8px' }} />
            <span>BaosZH 群聊</span>
          </a>
          
          {/* Baos Website */}
          <a href="https://www.baos.world/" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            textDecoration: 'none',
            marginBottom: '8px'
          }}>
            <img src="/internet.png" alt="Website" style={{ width: '20px', marginRight: '8px' }} />
            <span>BaosWorld 官网</span>
          </a>
          
          {/* 创作者Twitter */}
          <a href="https://x.com/qiyumeme" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            textDecoration: 'none',
            marginTop: '12px'
          }}>
            <img src="/twitter-icon.png" alt="Twitter" style={{ width: '20px', marginRight: '8px' }} />
            <span>二创来自「琦玉Saitama」</span>
          </a>
        </div>
      </div>
      
      {/* 添加图片到右下角 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 100,
      }}>
        <img 
          src="/qiyu_finish.png" 
          alt="Logo" 
          style={{
            width: '360px',
            height: 'auto',
          }} 
        />
      </div>
      
      {isLoading && (
        <div className="loading-container" style={{ color: '#ffffff', backgroundColor: 'transparent' }}>
          <div className="loading-spinner"></div>
          {/* 移除了此处的动画文本 */}
        </div>
      )}
      
      {error && (
        <div className="error-message" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <button onClick={handleRetry} style={{ marginRight: '10px' }}>重试</button>
          <button onClick={() => window.location.reload()}>刷新</button>
        </div>
      )}
      
      <div style={{ 
        display: isLoading ? 'none' : 'block',
        position: 'absolute',  // 绝对定位
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: '#000000'
      }}>
        <ErrorBoundary>
          <ModelViewer 
            key={`model-viewer-${renderAttempt}`}
            autoRotate={true} 
            onLoad={handleModelLoad} 
            onError={handleModelError}
            enlargeModel={true}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;