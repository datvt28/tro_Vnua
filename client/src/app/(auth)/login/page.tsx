'use client';
import { login } from '@/api/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { TfiReload } from 'react-icons/tfi';

interface IFormInput {
    email: string;
    password: string;
}

function LoginPage() {
    const router = useRouter();
    const { register, handleSubmit } = useForm<IFormInput>();
    const [hiddenPass, setHiddenPass] = useState(true);
    const [isRoting, setIsRoting] = useState(false);
    const [captcha, setCaptcha] = useState('');
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const drawCaptcha = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const captchaText = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
        setCaptcha(captchaText);
        console.log('Captcha:', captchaText);

        ctx.font = '30px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(captchaText, 50, 35);

        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            );
            ctx.lineTo(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            );
            ctx.strokeStyle = '#ccc';
            ctx.stroke();
        }
    };

    useEffect(() => {
        drawCaptcha();
    }, []);

    const onSubmit = (data: unknown) => {
        if (inputRef.current?.value !== captcha) {
            setError('Captcha không hợp lệ. Mời nhập lại!');
            return;
        }
        const fetchData = async () => {
            try {
                const response = await login(data);
                if (response) {
                    console.log(response.data);
                    toast.success('Đăng nhập thành công');
                    localStorage.setItem('token', response.data.accessToken);
                    setTimeout(() => {
                        router.push('/home');
                    }, 2000);
                }
            } catch (error) {
                toast.error('Sai tài khoản hoặc mật khẩu !');
                console.log(error);
            }
        };
        fetchData();
    };

    return (
        <div className="flex items-center justify-center h-[100vh] bg-[#efefef]">
            <div className="relative ">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-[28rem] px-[1.3rem] rounded-[0.6rem] shadow-custom-light roboto-bold bg-white "
                >
                    <Image
                        src={'/images/logo.png'}
                        alt=""
                        width={1000}
                        height={1000}
                        priority
                        className=" w-[14rem] h-[5rem] absolute top-0 left-[50%] transform translate-x-[-50%]"
                    ></Image>
                    <h1 className="pt-[4rem] roboto-bold text-center text-[1.2rem] ">
                        Đăng nhập
                    </h1>
                    <div className="mt-2">
                        <label className="block">Tài khoản</label>
                        <input
                            type="email"
                            {...register('email')}
                            placeholder="example@gmail.com"
                            required
                            className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                        />
                    </div>
                    <div className="mt-2">
                        <label className="block">Mật khẩu</label>
                        <div className="relative">
                            <input
                                type={hiddenPass ? 'password' : 'text'}
                                {...register('password')}
                                placeholder="Nhập mật khẩu của bạn"
                                required
                                className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                            />
                            <i
                                className="absolute cursor-pointer top-[50%] translate-y-[-50%] right-[5%]"
                                onClick={() => setHiddenPass(!hiddenPass)}
                            >
                                {hiddenPass ? <FaEyeSlash /> : <FaEye />}
                            </i>
                        </div>
                    </div>
                    <div className="mt-2">
                        <Link href={'/forgotPass'}>Quên mật khẩu ?</Link>
                    </div>
                    <div className="mt-3">
                        <div className="border-2 border-dotted w-full h-[5rem]">
                            <canvas
                                ref={canvasRef}
                                className="w-full h-full"
                                width="200"
                                height="50"
                            ></canvas>
                        </div>
                        <div className="flex w-full">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Xin hãy nhập captcha"
                                className="px-2 py-1 border-black border w-full text-center"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRoting(true);
                                    drawCaptcha();
                                    setTimeout(() => {
                                        setIsRoting(false);
                                    }, 1000);
                                }}
                                className="px-2 py-1 text-white bg-blue-500 h-"
                            >
                                <TfiReload
                                    className={`${isRoting ? 'spin' : ''}`}
                                />
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <button className="mt-2 w-full py-1 text-center rounded-[0.5rem] bg-rootColor hover:bg-[#699ba3d9] text-white">
                        Đăng nhập
                    </button>
                    <div className="mt-2 pb-[1.3rem]">
                        <div>
                            <p className="inline text-[#ccc]">
                                Chưa có tài khoản?{' '}
                            </p>
                            <Link
                                className="hover:underline hover:text-blue-400"
                                href={'/register'}
                            >
                                Đăng ký ngay!
                            </Link>
                        </div>
                        <Link
                            className="hover:underline hover:text-blue-400"
                            href={'/home'}
                        >
                            Tham gia với tư cách khách!
                        </Link>
                    </div>
                </form>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

export default LoginPage;
