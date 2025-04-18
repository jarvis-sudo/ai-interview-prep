import { isAuthenticated } from '@/lib/actions/auth.action';
//import { redirect } from 'next/dist/server/api-utils';
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'


const layout = async ({children} : {children : ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();
    console.log("userauth",isUserAuthenticated)
    if(!isUserAuthenticated) redirect("/sign-in");
  return (
    <div className='root-layout'>
        
        {children}
    </div>
  )
}

export default layout
