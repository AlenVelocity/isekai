/* eslint-disable @next/next/no-img-element */
import { FC } from 'react'
import Isekai from './Isekai'
const Nav: FC = () => {
    /**
        nav bar with tailwind css, with github logo on the right side transparent
     */
    return (
        <div>
            <nav className="bg-white shadow-md">
                <div className="container mx-auto flex flex-wrap items-center justify-between py-2 max-w-80">
                    <div className="pl-4">
                        <a className="text-gray-900 no-underline hover:no-underline font-bold text-xl">
                            <Isekai />
                        </a>

                        <a className="w-2 h-2">
                            <img
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                                alt="github logo"
                            />
                        </a>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Nav
