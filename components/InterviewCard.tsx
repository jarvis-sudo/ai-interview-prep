import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { cn, getRandomInterviewCover } from '@/lib/utils'
import dayjs from 'dayjs'
import { getFeedbackByInterviewId } from '@/lib/actions/general.action'

const InterviewCard = async ({
    interviewId,
    userId,
    role,
    type,
    techstack,
    createdAt,
} : InterviewCardProps) => {

    const feedback = 
    userId && interviewId ? await getFeedbackByInterviewId({
        interviewId,
        userId,
    }) : null;
      
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

    const badgeColor = {
        Behavioral : "bg-light-400",
        Mixed : "bg-light-600",
        Technical : "bg-light-800",
    }[normalizedType] || "bg-light-600";

    const formattedDate = dayjs(
        feedback?.createdAt  || createdAt || Date.now() 
    ).format("MM DD YYYY")
    

  return (
    <div className='card-border w-[360px] max-sm:w-full min-h-96'>
        <div className='card-interview'>
            <div>
                <div
                className={cn(
                    "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
                    badgeColor
                )}
                >
                    <p>{normalizedType}</p>
                </div>
                <Image
                src={getRandomInterviewCover()}
                alt="cover-image"
                width={90}
                height={90}
                className='rounded-full object-fit size=[90px]'
                />
            

                <h3>{role} interview</h3>
                <div>
                    <div>
                        <Image
                        src="/calender.svg"
                        width={22}
                        height={22}
                        alt='calender'
                        />
                        <p>{formattedDate}</p>
                    </div>

                    <div>
                        <Image
                        src="/star.svg"
                        width={22}
                        height={22}
                        alt="star"
                        />
                        <p>/100</p>
                    </div>

                </div>
                <p>"You havent taken this interview yet. Take it now to improve your skills.</p>
            </div>
            <div>
                <Button>
                {/*    <Link
                    href={
                        feedback ? `/interview` : `/interview`
                    }
                    >
                    {feedback ? "Chceck Feedback" : "view Interview"}
                    </Link> */}
                </Button>
            </div>
        </div>
    </div>
  )
}

export default InterviewCard