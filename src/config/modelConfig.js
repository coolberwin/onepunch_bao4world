/**
 * 3D模型配置文件
 */

const config = {
  // 主模型路径 (相对于public文件夹)
  modelPath: '/models/ball.glb',
  
  // 备用模型路径，如果主模型加载失败
  fallbackModelPath: '/models/fallback.glb',
  
  // 模型加载超时时间（毫秒）
  loadTimeout: 15000,
  
  // 模型渲染设置
  renderSettings: {
    autoRotate: true,
    autoRotateSpeed: 0.5, // 减慢旋转速度，让大模型看起来更清晰
    backgroundColor: '#FFDAB9', // 浅橙色背景
    cameraFov: 65, 
    cameraNear: 0.1,
    cameraFar: 1000,
    initialCameraPosition: { x: 0, y: 0, z: 3 } // 调整相机位置使模型看起来更大
  }
};

export default config;
