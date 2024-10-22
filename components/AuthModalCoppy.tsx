// import { useState } from 'react';
// import Modal from './Modal';
//
// interface AuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }
//
// export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
//   const [isLogin, setIsLogin] = useState(true);
//
//   const toggleMode = () => setIsLogin(!isLogin);
//
//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <h2 className="text-2xl font-bold mb-4 text-blue-700">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
//       <form className="space-y-4">
//         <div>
//           <label htmlFor="email" className="block mb-1 text-gray-700">Email</label>
//           <input type="email" id="email" className="w-full border rounded px-3 py-2 text-gray-800" />
//         </div>
//         <div>
//           <label htmlFor="password" className="block mb-1 text-gray-700">Mật khẩu</label>
//           <input type="password" id="password" className="w-full border rounded px-3 py-2 text-gray-800" />
//         </div>
//         {!isLogin && (
//           <div>
//             <label htmlFor="confirmPassword" className="block mb-1 text-gray-700">Xác nhận mật khẩu</label>
//             <input type="password" id="confirmPassword" className="w-full border rounded px-3 py-2 text-gray-800" />
//           </div>
//         )}
//         <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300">
//           {isLogin ? 'Đăng nhập' : 'Đăng ký'}
//         </button>
//       </form>
//       <p className="mt-4 text-center text-gray-600">
//         {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
//         <button onClick={toggleMode} className="text-blue-600 hover:text-blue-800 hover:underline ml-1 transition duration-300">
//           {isLogin ? 'Đăng ký' : 'Đăng nhập'}
//         </button>
//       </p>
//     </Modal>
//   );
// }