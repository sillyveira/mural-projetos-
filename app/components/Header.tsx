'use client';

import Image from 'next/image';
import logo from '../../public/logo.svg';
import {fonts, colors} from '../utils/theme';

export default function Header() {
    return (
        <header className={`${colors.background.primary}`}>
            <div className='max-w-7xl mx-auto px-8 py-8 flex items-center justify-between'>
                <div className='flex items-center gap-6'>
                    <div className='relative rounded-lg w-30 h-30 overflow-hidden'>
                        <Image src={logo} alt='Logo SEAL' fill className='object-contain'/>
                    </div>

                    <div className='text-left'>
                        <h1 className={`${colors.text.white}  text-2xl md:text-5xl ${fonts.title} mb-2`}>
                            MURAL DE PROJETOS
                        </h1>

                        <p className={`${colors.text.subtle} text-lg ${fonts.body} mt-2`}>
                            Liga Acadêmica de Engenharia de Software - SEAL
                        </p>
                    </div>

                </div>
                <div className={`${colors.background.secondary} ${colors.border.default} rounded-xl p-4 text-center`}>
                    <div className='bg-white w-32 h-32 flex items-center justify-center mb-2 rounded'>
                    </div>
                    <p className={`${colors.text.gray} text-sm font-medium ${fonts.body}`}>
                        Envie seu projeto
                    </p>
                </div>
            </div>
        </header>
    );
}