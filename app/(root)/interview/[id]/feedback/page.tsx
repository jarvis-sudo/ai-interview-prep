import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getFeedbackByInterviewId, getInterviewById } from '@/lib/actions/general.action';
import dayjs from "dayjs"
import Image from 'next/image'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

const Feedback =async ({params} : RouteParams) => {
    const {id} = await params;
    const user = await getCurrentUser();
    
    const interview = await getInterviewById(id);
    if(!interview) redirect("/")

      const feedback = await getFeedbackByInterviewId({
        interviewId : id,
        userId : user?.id!,
      })
  return (
    <section>
      <div>
        <h1>
          Feedback on the interview
          <span>Interview</span>
        </h1>
      </div>

      <div>
        <div>
          <div>
            <Image src="/star.svg" alt="star" height={22} width={22} />
            <p>
              Overall Impression:
              <span>{feedback?.totalScore}</span>
              /100
            </p>
          </div>
          {/* Date */}
          <div>
            <Image src="calender.svg" alt="calender" width={22} height={22} />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MM DD YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      {/* Interview breakdown */}
      <div>
        <h2>Breakdown of the Interview : </h2>
        {feedback?.categoryScores?.map((category,index) => (
            <div>
                <p>
                    {index + 1}. {category.name} ({category.score}/100)
                </p>
                <p>{category.comment}</p>
            </div>
        ))}
      </div>
      <div>
        <h3>Srengths</h3>
        <ul>
            {feedback?.strengths?.map((strength,index) => (
                <li key={index}>{strength}</li>
            ))}
        </ul>
      </div>

      <div>
        <Button>
            <Link href={"/"}>
            <p>Back to dashboard</p>
            </Link>
        </Button>

        <Button>
            <Link href={`/interview/${id}`}>
            <p>Retake Interview</p>
            </Link>
        </Button>
      </div>
    </section>
  );
}

export default Feedback;