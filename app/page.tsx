import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviewsByUserId, getLatestInterviews } from '@/lib/actions/general.action'
import Image from 'next/image'
import Link from 'next/link'
import { userAgent } from 'next/server'
import React from 'react'

 async function Home() {

    const user = await getCurrentUser();
    console.log("userId",user?.id);

    const [userInterviews,allInterviews] = await Promise.all([
        getInterviewsByUserId(user?.id!),
        getLatestInterviews({ userId : user?.id! }),
    ])

    const hasPastInterviews = userInterviews?.length! > 0;
    const hasUpcomingInterviews = allInterviews?.length! > 0;

    console.log("userInterviews",userInterviews?.length)
    console.log("all interviews",allInterviews?.length);

  return (
    <>
    <section className='card-cta'>
        <div className='flex flex-col gap-6 max-w-lg'>
            <h2>Get Inteview-Ready with AI-Powered Practice & Feedback</h2>
            <p>Practice real interview questions & get instantt feedback</p>
            <Button className='btn-primary max-sm:w-full'>
                <Link href="/interview">Start an Interview</Link>
            </Button>
        </div>

        <Image
        src="/robot.png"
        alt='robo-dude'
        width={400}
        height={400}
        className='max-sm:hidden'
        />
    </section>

    <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>

        <div className='interviews-section'>
            {hasPastInterviews ? (
                userInterviews?.map((interview) => (
                    <InterviewCard
                    key={interview.id}
                    userId={user?.id}
                    interviewId={interview.id}
                    role={interview.role}
                    type={interview.type}
                    techstack={interview.techStack}
                    createdAt={interview.createdAt}
                    />
                ))
            ) : (
                <p>You havent taken any interviews yet</p>
            )}
        </div>
    </section>

    <section className='flex flex-col gap-6 mt-8'>
        <h2>Take Interviews</h2>

        <div>
            {hasUpcomingInterviews ? (
                allInterviews?.map((interview) => (
                    <InterviewCard
                    key={interview.id}
                    userId={user?.id}
                    interviewId={interview.id}
                    role={interview.role}
                    type={interview.type}
                    techstack={interview.techStack}
                    createdAt={interview.createdAt}
                    />
                ))
            ) : (
                <p>There are no interviews available</p>
            )}
        </div>
    </section>
    </>
  )
}

export default Home;


