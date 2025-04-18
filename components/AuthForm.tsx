"use client"
import Image from 'next/image'
import React from 'react';
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {auth} from "@/firebase/client"
import {
  Form
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner';
//import { signUp } from '@/lib/actions/auth.action';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import {signIn,signUp} from "@/lib/actions/auth.action"
import FormField from './FormField';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


const authFormSchema = (type : FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
  email:z.string().email(),
  password:z.string().min(3)
  })
}




const AuthForm = ({ type } : { type : FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);
   // 1. Define your form.
   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email:"",
      password:"",
    },
  })
 
  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {
      if(type === "sign-up") {
        const {name,email,password} = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


        const result = await signUp({
          uid : userCredential.user.uid,
          name : name!,
          email,
          password,
        })

        if(!result) {
          toast.error("Something wentt wrong, result is undefined")
          return ;
        }

        if(!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success("Account created Successfully. please sign in.");
        router.push("/sign-in");
      }
      else{
        const {email,password} = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

        const idToken = await userCredential.user.getIdToken();
        if(!idToken) {
          toast.error("sign in failed.Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        })

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  }

  const isSignIn = type === "sign-in";
  return (
    <div className='card-border lg:min-w-[566px]'>
      <div className='flex flex-col gap-6 card py-14 px-10'>
        <div className='flex flex-row gap-2 justify-center'>
          
          <h2 className='text-primary-100'>Prepwise</h2>
        </div>
        <h3>Practice job interviews</h3>

        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mt-4 form space-y-6">
        {!isSignIn && (
          <FormField
        control={form.control}
        name="name"
        label="name"
        placeholder="Your name"
        type="text"
        />
        )}
        

        <FormField
        control={form.control}
        name="email"
        label="email"
        placeholder="email"
        type="email"
        />

        <FormField
        control={form.control}
        name="password"
        label="password"
        placeholder="password"
        type="password"
        />
        <Button className='btn' type="submit">{isSignIn ? "Sign In" : "Create an Account"}</Button>
      </form>
    </Form>

        <p className='text-shadow-center'>{isSignIn ? "No acccooount Yet?" : "HAve an account already?"}
        <Link 
        href={!isSignIn ? "/sign-in" : "/sign-up"}
        className='font-bold text-user-primary ml-1'
        >{!isSignIn ? "Sign In" : "Sign Up"}</Link>
        </p>
      </div>
    </div>
  )
}

export default AuthForm