import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import modelConfig from '../config/modelConfig';

// 从配置文件获取模型路径
const MODEL_PATH = modelConfig.modelPath;

// 作为备选，创建一个简单的立方体模型
const createFallbackModel = (scene) => {
  console.log("创建备用模型");
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00,
    wireframe: true
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  
  // 添加动画
  const animate = () => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  };
  
  return { model: cube, animate };
};

const ModelViewer = ({ autoRotate = false, onLoad, onError, enlargeModel = false }) => {
  const mountRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("初始化 ModelViewer");

    let scene, camera, renderer, controls;
    let model = null;
    let animationFrameId;
    let animateModel = null;

    // 创建场景
    try {
      // 初始化场景 - 设置纯黑色背景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      
      // 调整灯光以适应黑色背景并确保模型照明均匀
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // 增加环境光强度
      scene.add(ambientLight);
      
      // 添加多个方向光源确保模型各个方向都有光照
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight1.position.set(1, 1, 1);
      scene.add(directionalLight1);
      
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);
      
      const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.3);
      directionalLight3.position.set(0, 1, -1);
      scene.add(directionalLight3);

      // 设置相机，确保视口比例正确
      const container = mountRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // 使用透视相机，视场角65度
      camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
      
      // 将相机初始位置放在正面
      camera.position.z = 5;
      camera.position.y = 0;
      camera.position.x = 0;
      camera.lookAt(0, 0, 0); // 相机看向原点
      
      // 设置渲染器，注意更新了输出编码设置
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      
      // 根据Three.js版本使用正确的输出编码
      if (THREE.ColorManagement) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      } else if (renderer.outputEncoding !== undefined) {
        renderer.outputEncoding = THREE.sRGBEncoding;
      }
      
      container.appendChild(renderer.domElement);
      
      // 设置控制器
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.8; // 降低旋转速度
      
      // 设置控制中心为原点，确保旋转和缩放都围绕模型中心
      controls.target.set(0, 0, 0);
      
      // 响应窗口大小变化
      const handleResize = () => {
        if (!mountRef.current) return;
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        // 强制渲染以更新视图
        if (scene && camera) {
          renderer.render(scene, camera);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // 使用DRACO压缩加载器提高性能
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      
      // 加载模型
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      
      console.log("尝试加载模型:", MODEL_PATH);
      
      // 设置请求头以避免浏览器缓存问题
      const modelUrl = MODEL_PATH + '?v=' + new Date().getTime();
      console.log("实际加载URL:", modelUrl);
      
      // 尝试加载模型
      try {
        loader.load(
          modelUrl,
          (gltf) => {
            model = gltf.scene;
            
            try {
              // 计算模型包围盒
              const box = new THREE.Box3().setFromObject(model);
              
              // 确保包围盒有效
              if (box.min.x !== Infinity) {
                // 计算包围盒中心点
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // 计算模型大小的最大维度
                const maxDim = Math.max(size.x, size.y, size.z);
                
                // 根据视场角和模型大小计算相机距离
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
                
                // 根据模型大小调整相机距离
                cameraZ *= 1.2; // 调整系数，确保模型完全在视野内
                camera.position.z = cameraZ;
                
                // 关键步骤：将模型移动到场景原点，确保居中
                model.position.x = -center.x;
                model.position.y = -center.y;
                model.position.z = -center.z;
                
                console.log('已调整模型至中心位置，相机距离:', cameraZ);
              } else {
                console.warn("模型包围盒无效，使用默认位置");
                // 如果无法计算包围盒，也将模型移至中心
                model.position.set(0, 0, 0);
              }
              
              // 添加模型到场景
              scene.add(model);
              console.log('模型加载成功', gltf);
              
              // 重新计算控制器轨道中心点
              controls.target.set(0, 0, 0);
              controls.update();
            } catch (layoutError) {
              console.warn("调整模型布局时出错:", layoutError);
              // 出错时也尝试居中处理
              model.position.set(0, 0, 0);
              scene.add(model);
            }
            
            setLoaded(true);
            if (onLoad) onLoad();
          },
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            console.log('加载进度:', percent.toFixed(2), '%');
            setLoadingProgress(percent);
          },
          (error) => {
            console.error('模型加载错误:', error);
            console.error('模型路径:', modelUrl);
            console.error('错误类型:', error.constructor.name);
            
            // 添加更详细的错误信息
            let errorMsg = '模型加载失败';
            if (error.message && error.message.includes('<!doctype')) {
              errorMsg = '服务器返回了HTML而不是模型文件，请检查路径是否正确';
            } else if (error.message) {
              errorMsg = error.message;
            }
            
            // 创建一个备用模型
            const fallback = createFallbackModel(scene);
            model = fallback.model;
            animateModel = fallback.animate;
            
            setLoaded(true);
            
            if (onError) onError({...error, customMessage: errorMsg});
          }
        );
      } catch (loadError) {
        console.error("加载模型时发生未捕获的错误:", loadError);
        
        // 创建一个备用模型
        const fallback = createFallbackModel(scene);
        model = fallback.model;
        animateModel = fallback.animate;
        
        setLoaded(true);
        
        if (onError) onError(loadError);
      }
      
      // 渲染循环
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        if (animateModel) {
          animateModel();
        }
        
        controls.update(); // 更新控制器
        renderer.render(scene, camera);
      };
      
      animate();
      
      // 清理函数
      return () => {
        console.log('清理Three.js资源');
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        
        // 清除场景中的所有对象
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        
        // 从DOM中移除渲染器
        if (renderer && renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        
        // 释放资源
        if (renderer) renderer.dispose();
        if (controls) controls.dispose();
      };
    } catch (error) {
      console.error('Three.js初始化错误:', error);
      if (onError) onError(error);
      return () => {};
    }
  }, [autoRotate, onLoad, onError, enlargeModel]);
  
  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100vh',
        position: 'relative',
        background: '#000000',
        display: 'flex',          // 使用flexbox布局
        justifyContent: 'center', // 水平居中
        alignItems: 'center',     // 垂直居中
        overflow: 'hidden'        // 防止溢出
      }}
    >
      {!loaded && (
        <div style={{ 
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          background: 'rgba(0,0,0,0.7)'
        }}>
          {/* 简化文字显示，只保留进度条 */}
          <div style={{ width: '80%', height: '10px', background: '#333', borderRadius: '5px' }}>
            <div style={{ 
              width: `${loadingProgress}%`, 
              height: '100%', 
              background: '#4CAF50',
              borderRadius: '5px'
            }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;