import { useState, useEffect } from 'react';
import Modal from './Modal';
import { setAccessToken, setRefreshToken } from "@/lib/tokens";
import { StatusCode } from "@/lib/statusCodes";
import { getAccessToken } from "@/lib/tokens";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = getAccessToken();
            setIsAuthenticated(!!token);
        };
        
        checkAuth();
    }, []);

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setAddress('');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                const { accessToken, refreshToken } = data.data;
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);
                setIsAuthenticated(true);
                onClose();
                window.location.reload();
            } else {
                if (password !== confirmPassword) {
                    setError('Mật khẩu không khớp.');
                    return;
                }

                if (!username || !password || !email) {
                    setError('Username, password và email là bắt buộc.');
                    return;
                }

                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        username, 
                        password, 
                        email, 
                        firstName, 
                        lastName,
                        phone,
                        address,
                        status: 1
                    }),
                });

                const data = await response.json();

                if (response.status === StatusCode.CONFLICT) {
                    setError('Username hoặc email đã tồn tại.');
                    return;
                }

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                setShowSuccessPopup(true);
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFirstName('');
                setLastName('');
                setPhone('');
                setAddress('');
            }
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Có lỗi xảy ra.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block mb-1 text-gray-700">Tên đăng nhập</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-gray-800"
                        required
                    />
                </div>
                {!isLogin && (
                    <>
                        <div>
                            <label htmlFor="email" className="block mb-1 text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-gray-800"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="firstName" className="block mb-1 text-gray-700">Tên</label>
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-gray-800"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block mb-1 text-gray-700">Họ</label>
                            <input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-gray-800"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block mb-1 text-gray-700">Số điện thoại</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-gray-800"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block mb-1 text-gray-700">Địa chỉ</label>
                            <textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full border rounded px-3 py-2 text-gray-800"
                                rows={3}
                            />
                        </div>
                    </>
                )}
                <div>
                    <label htmlFor="password" className="block mb-1 text-gray-700">Mật khẩu</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-gray-800"
                        required
                    />
                </div>
                {!isLogin && (
                    <div>
                        <label htmlFor="confirmPassword" className="block mb-1 text-gray-700">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-gray-800"
                            required
                        />
                    </div>
                )}
                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300">
                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </button>
            </form>
            <p className="mt-4 text-center text-gray-600">
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <button onClick={toggleMode} className="text-blue-600 hover:text-blue-800 hover:underline ml-1 transition duration-300">
                    {isLogin ? 'Đăng ký' : 'Đăng nhập'}
                </button>
            </p>

            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-green-600">Đăng ký thành công!</h3>
                        <p className="mb-4">Tài khoản của bạn đã được tạo.</p>
                        <button
                            onClick={() => {
                                setShowSuccessPopup(false);
                                setIsLogin(true);
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
